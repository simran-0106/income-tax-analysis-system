import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import {
  UploadFile,
  TableChart,
  Assessment,
  CheckCircleOutline,
  Warning,
  Info,
} from '@mui/icons-material';

export default function Guidelines() {
  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Data Upload Guidelines
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Instructions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <UploadFile color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Upload Instructions</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Supported Formats" 
                    secondary="CSV or Excel (.xlsx) files"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="File Size" 
                    secondary="Maximum 10MB recommended"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Data Headers" 
                    secondary="Must include required columns"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Required Columns */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TableChart color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Required Columns</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f7ff' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Column Format:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Date" 
                      secondary="YYYY-MM-DD format"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Category" 
                      secondary="Transaction category"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Description" 
                      secondary="Transaction details"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Amount" 
                      secondary="Numeric value"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Type" 
                      secondary="'Income' or 'Expense'"
                    />
                  </ListItem>
                </List>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Interpretation */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Risk Interpretation</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Warning sx={{ color: '#2ecc71' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="No Risk (0.0)" 
                    secondary="Normal transaction patterns"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Warning sx={{ color: '#3498db' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Low Risk (0.1 - 0.25)" 
                    secondary="Minor anomalies detected"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Warning sx={{ color: '#f39c12' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Medium Risk (0.25 - 0.6)" 
                    secondary="Significant deviations"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Warning sx={{ color: '#e74c3c' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="High Risk (0.6 - 1.0)" 
                    secondary="Potential fraud indicators"
                  />
                </ListItem>
              </List>
              <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                <Typography variant="body2" color="warning.dark">
                  Note: Risk scores are calculated based on transaction amount, category, and pattern analysis.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sample Data Preview */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Sample Data Format
        </Typography>
        <Paper sx={{ p: 2, bgcolor: '#f5f7ff', overflowX: 'auto' }}>
          <Typography variant="caption" component="pre" sx={{ m: 0 }}>
            Date,Category,Description,Amount,Type
            2025-01-05,Salary,Monthly Salary,55000,Income
            2025-01-08,Food,Restaurant Dinner,800,Expense
            2025-01-10,Transport,Uber Ride,250,Expense
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}