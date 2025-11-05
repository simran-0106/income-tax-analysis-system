import os
import pandas as pd
import plotly.express as px

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
UPLOADS = os.path.join(BASE, 'uploads')
SAMPLE = os.path.join(UPLOADS, 'sample_financial_data.csv')

def load_data(path):
    df = pd.read_csv(path, parse_dates=['Date'])
    return df

def augment(df):
    # Simple tax calculation: 20% on Income rows, 0 otherwise
    df['tax'] = df.apply(lambda r: r['Amount'] * 0.2 if r['Type'].lower() == 'income' else 0.0, axis=1)

    # Fraud risk heuristic: large amounts get higher risk; some categories more suspicious
    amt_mean = df['Amount'].mean()
    amt_std = df['Amount'].std(ddof=0) if df['Amount'].std(ddof=0) > 0 else 1

    suspicious_cats = {'investment', 'bonus', 'freelance'}

    def risk_score(row):
        score = 0.0
        if row['Amount'] > amt_mean:
            score += min(1.0, (row['Amount'] - amt_mean) / (3 * amt_std))
        if str(row['Category']).strip().lower() in suspicious_cats:
            score += 0.4
        return min(1.0, score)

    df['fraud_risk'] = df.apply(risk_score, axis=1)
    df['fraud_level'] = pd.cut(df['fraud_risk'], bins=[-0.01, 0.0, 0.25, 0.6, 1.0], labels=['None','Low','Medium','High'])
    return df

def make_income_tax_plot(df, out_html, out_png):
    incomes = df[df['Type'].str.lower() == 'income']
    if incomes.empty:
        incomes = df.copy()

    fig = px.scatter(incomes, x='Amount', y='tax', color='fraud_risk', size='Amount', hover_data=['Category','Description','Date'],
                     color_continuous_scale='Viridis', title='Income vs Tax (size=amount, color=fraud risk)')
    fig.update_layout(template='plotly_white')
    fig.write_html(out_html, include_plotlyjs='cdn')
    try:
        fig.write_image(out_png)
    except Exception:
        # If kaleido is not installed, skip PNG
        pass

def make_fraud_bar(df, out_html, out_png):
    counts = df.groupby('fraud_level').size().reset_index(name='count')
    fig = px.bar(counts, x='fraud_level', y='count', color='fraud_level', title='Fraud Risk Distribution')
    fig.update_layout(template='plotly_white', showlegend=False)
    fig.write_html(out_html, include_plotlyjs='cdn')
    try:
        fig.write_image(out_png)
    except Exception:
        pass

def ensure_uploads():
    if not os.path.isdir(UPLOADS):
        os.makedirs(UPLOADS)

def main():
    ensure_uploads()
    df = load_data(SAMPLE)
    df = augment(df)

    # Save augmented data as CSV for Power BI
    out_csv = os.path.join(UPLOADS, 'sample_augmented.csv')
    df.to_csv(out_csv, index=False)
    print('Saved augmented data:', out_csv)

    out1_html = os.path.join(UPLOADS, 'visualization_income_tax.html')
    out1_png = os.path.join(UPLOADS, 'visualization_income_tax.png')
    make_income_tax_plot(df, out1_html, out1_png)

    out2_html = os.path.join(UPLOADS, 'visualization_fraud_bar.html')
    out2_png = os.path.join(UPLOADS, 'visualization_fraud_bar.png')
    make_fraud_bar(df, out2_html, out2_png)

    print('Generated:', out1_html, out1_png, out2_html, out2_png)

if __name__ == '__main__':
    main()
