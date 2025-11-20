// Export service for CSV generation
import { App, Review, AnalysisResult } from '../types';

export const exportReviewsToCSV = (app: App, reviews: Review[]): void => {
  const headers = ['Rating', 'Author', 'Date', 'Title', 'Content'];
  const rows = reviews.map(review => [
    review.rating.toString(),
    review.author,
    review.date,
    review.title,
    review.content.replace(/"/g, '""'), // Escape quotes
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadCSV(csvContent, `${app.name}_reviews.csv`);
};

export const exportAnalysisToCSV = (
  app: App,
  analysis: AnalysisResult,
  tags: string[]
): void => {
  const content = [
    ['App Name', app.name],
    ['Developer', app.developer],
    ['Rating', app.rating.toString()],
    ['Reviews Count', app.reviewsCount],
    [''],
    ['Summary', analysis.summary.replace(/"/g, '""')],
    [''],
    ['Common Complaints'],
    ...analysis.commonComplaints.map(complaint => ['', complaint.replace(/"/g, '""')]),
    [''],
    ['Feature Requests'],
    ...analysis.featureRequests.map(request => ['', request.replace(/"/g, '""')]),
    [''],
    ['Monetization', analysis.monetization.replace(/"/g, '""')],
    [''],
    ['Market Opportunities', analysis.marketOpportunities.replace(/"/g, '""')],
    [''],
    ['AI Tags'],
    ...tags.map(tag => ['', tag]),
  ];

  const csvContent = content.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');

  downloadCSV(csvContent, `${app.name}_analysis.csv`);
};

const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

