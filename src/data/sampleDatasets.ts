import { ParsedSheet } from '../types/sheet';

export interface SampleDataset {
  id: string;
  title: string;
  tamilTitle: string;
  description: string;
  tamilDescription: string;
  isRetailReport?: boolean;
  file1: {
    name: string;
    sheet: ParsedSheet;
  };
  file2: {
    name: string;
    sheet: ParsedSheet;
  };
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'retail_stock_sales_photo',
    title: 'Garment Stock & Sales (As in Photo)',
    tamilTitle: 'புகைப்படத்தில் உள்ள ஆடை இருப்பு & விற்பனை அறிக்கை',
    description: 'Exact Stock and Sales reports from your photo with locations (Koottapalli - KP, Karur - KR, Salem - SLM, Namkkal - NKL, Kumbakonam - KUM, Tiruvannamalai - TVM, Mallur - MLR, GM Warehouse - GD).',
    tamilDescription: 'நீங்கள் அனுப்பிய புகைப்படத்தில் உள்ள அதே கோப்பு: இருப்பு (Stock) மற்றும் விற்பனை (Sales) அறிக்கைகளை பக்கவாட்டில் ஒரே தாளில் இணைக்கும்.',
    isRetailReport: true,
    file1: {
      name: 'STOCK_REPORT_02.10.2026.xlsx',
      sheet: {
        name: 'Stock_Report',
        columns: ['Color', 'Toon Label', 'Size', 'Koottapalli', 'Karur', 'Salem', 'Namkkal', 'Kumbakonam', 'Tiruvannamalai', 'Mallur', 'GM Warehouse', 'TOTAL'],
        totalRows: 28,
        rows: [
          // SMOKE GREY
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '3-4Yrs', Koottapalli: 3, Karur: 0, Salem: 3, Namkkal: 3, Kumbakonam: 3, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 14 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '5-6Yrs', Koottapalli: 3, Karur: 0, Salem: 3, Namkkal: 1, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 11 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '7-8Yrs', Koottapalli: 2, Karur: 0, Salem: 3, Namkkal: 1, Kumbakonam: 1, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 9 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '9-10Yrs', Koottapalli: 4, Karur: 0, Salem: 3, Namkkal: 4, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 15 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '11-12Yrs', Koottapalli: 3, Karur: 0, Salem: 4, Namkkal: 3, Kumbakonam: 3, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 15 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '13-14Yrs', Koottapalli: 2, Karur: 0, Salem: 3, Namkkal: 4, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 13 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '15-16Yrs', Koottapalli: 2, Karur: 0, Salem: 3, Namkkal: 4, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 13 },

          // LIGHT BEIGE
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '3-4Yrs', Koottapalli: 4, Karur: 0, Salem: 3, Namkkal: 2, Kumbakonam: 3, Tiruvannamalai: 3, Mallur: 0, 'GM Warehouse': 0, TOTAL: 15 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '5-6Yrs', Koottapalli: 1, Karur: 0, Salem: 3, Namkkal: 3, Kumbakonam: 3, Tiruvannamalai: 3, Mallur: 0, 'GM Warehouse': 0, TOTAL: 13 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '7-8Yrs', Koottapalli: 0, Karur: 0, Salem: 2, Namkkal: 1, Kumbakonam: 1, Tiruvannamalai: 1, Mallur: 0, 'GM Warehouse': 0, TOTAL: 5 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '9-10Yrs', Koottapalli: 2, Karur: 0, Salem: 1, Namkkal: 1, Kumbakonam: 1, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 7 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '11-12Yrs', Koottapalli: 2, Karur: 0, Salem: 0, Namkkal: 1, Kumbakonam: 1, Tiruvannamalai: 1, Mallur: 0, 'GM Warehouse': 0, TOTAL: 5 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '13-14Yrs', Koottapalli: 2, Karur: 0, Salem: 3, Namkkal: 2, Kumbakonam: 2, Tiruvannamalai: 3, Mallur: 0, 'GM Warehouse': 0, TOTAL: 12 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '15-16Yrs', Koottapalli: 4, Karur: 0, Salem: 4, Namkkal: 3, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 15 },

          // CREAM
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '3-4Yrs', Koottapalli: 3, Karur: 0, Salem: 3, Namkkal: 3, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 13 },
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '5-6Yrs', Koottapalli: 3, Karur: 0, Salem: 2, Namkkal: 3, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 12 },
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '7-8Yrs', Koottapalli: 1, Karur: 0, Salem: 1, Namkkal: 1, Kumbakonam: 1, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 6 },
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '9-10Yrs', Koottapalli: 2, Karur: 0, Salem: 3, Namkkal: 2, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 11 },
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '11-12Yrs', Koottapalli: 2, Karur: 0, Salem: 2, Namkkal: 3, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 11 },
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '13-14Yrs', Koottapalli: 3, Karur: 0, Salem: 2, Namkkal: 3, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 12 },
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '15-16Yrs', Koottapalli: 2, Karur: 0, Salem: 2, Namkkal: 2, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 10 },

          // HALF WHITE
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '3-4Yrs', Koottapalli: 2, Karur: 0, Salem: 3, Namkkal: 3, Kumbakonam: 3, Tiruvannamalai: 3, Mallur: 0, 'GM Warehouse': 0, TOTAL: 14 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '5-6Yrs', Koottapalli: 2, Karur: 0, Salem: 3, Namkkal: 1, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 10 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '7-8Yrs', Koottapalli: 1, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 0, Tiruvannamalai: 1, Mallur: 0, 'GM Warehouse': 0, TOTAL: 3 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '9-10Yrs', Koottapalli: 1, Karur: 0, Salem: 1, Namkkal: 2, Kumbakonam: 1, Tiruvannamalai: 1, Mallur: 0, 'GM Warehouse': 0, TOTAL: 6 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '11-12Yrs', Koottapalli: 1, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 1, Tiruvannamalai: 1, Mallur: 0, 'GM Warehouse': 0, TOTAL: 4 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '13-14Yrs', Koottapalli: 2, Karur: 0, Salem: 2, Namkkal: 3, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 0, 'GM Warehouse': 0, TOTAL: 11 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '15-16Yrs', Koottapalli: 3, Karur: 0, Salem: 3, Namkkal: 3, Kumbakonam: 2, Tiruvannamalai: 2, Mallur: 1, 'GM Warehouse': 0, TOTAL: 14 },
        ],
      },
    },
    file2: {
      name: 'SALES_REPORT_02.10.2026.xlsx',
      sheet: {
        name: 'Sales_Report',
        columns: ['Color', 'Toon Label', 'Size', 'Koottapalli', 'Karur', 'Salem', 'Namkkal', 'Kumbakonam', 'Tiruvannamalai', 'Mallur', 'GM Warehouse', 'TOTAL'],
        totalRows: 17,
        rows: [
          // SMOKE GREY sales
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '3-4Yrs', Koottapalli: 0, Karur: 0, Salem: 0, Namkkal: 0, Kumbakonam: 1, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '5-6Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 2, Tiruvannamalai: 1, Mallur: 0, 'GM Warehouse': 0, TOTAL: 4 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '7-8Yrs', Koottapalli: 0, Karur: 0, Salem: 2, Namkkal: 0, Kumbakonam: 3, Tiruvannamalai: 1, Mallur: 0, 'GM Warehouse': 0, TOTAL: 6 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '13-14Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 0, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'SMOKE GREY', 'Toon Label': '7-LK002-01', Size: '15-16Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 0, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },

          // LIGHT BEIGE sales
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '3-4Yrs', Koottapalli: 0, Karur: 0, Salem: 0, Namkkal: 1, Kumbakonam: 0, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '5-6Yrs', Koottapalli: 0, Karur: 0, Salem: 3, Namkkal: 1, Kumbakonam: 0, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 4 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '7-8Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 0, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '11-12Yrs', Koottapalli: 0, Karur: 0, Salem: 0, Namkkal: 0, Kumbakonam: 1, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '13-14Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 1, Tiruvannamalai: 1, Mallur: 0, 'GM Warehouse': 0, TOTAL: 3 },
          { Color: 'LIGHT BEIGE', 'Toon Label': '7-LK002-02', Size: '15-16Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 1, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 2 },

          // CREAM sales
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '7-8Yrs', Koottapalli: 0, Karur: 0, Salem: 2, Namkkal: 1, Kumbakonam: 1, Tiruvannamalai: 1, Mallur: 0, 'GM Warehouse': 0, TOTAL: 5 },
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '13-14Yrs', Koottapalli: 0, Karur: 0, Salem: 0, Namkkal: 1, Kumbakonam: 0, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'CREAM', 'Toon Label': '7-LK002-03', Size: '15-16Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 1, Kumbakonam: 0, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 2 },

          // HALF WHITE sales
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '5-6Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 1, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 2 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '7-8Yrs', Koottapalli: 0, Karur: 0, Salem: 0, Namkkal: 0, Kumbakonam: 1, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '9-10Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 0, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '11-12Yrs', Koottapalli: 0, Karur: 0, Salem: 0, Namkkal: 0, Kumbakonam: 1, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '13-14Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 0, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 1 },
          { Color: 'HALF WHITE', 'Toon Label': '7-LK002-04', Size: '15-16Yrs', Koottapalli: 0, Karur: 0, Salem: 1, Namkkal: 0, Kumbakonam: 1, Tiruvannamalai: 0, Mallur: 0, 'GM Warehouse': 0, TOTAL: 2 },
        ],
      },
    },
  },
  {
    id: 'sales_q1_q2',
    title: 'Quarterly Sales Records (Q1 & Q2)',
    tamilTitle: 'காலாண்டு விற்பனை கோப்புகள் (Q1 & Q2)',
    description: 'Merge Q1 and Q2 sales reports with column alignment and format guard.',
    tamilDescription: 'Q1 மற்றும் Q2 விற்பனை அறிக்கைகளை ஒன்றாக இணைத்தல்.',
    file1: {
      name: 'Sales_Report_Q1_2024.xlsx',
      sheet: {
        name: 'Q1_Sales',
        columns: ['Transaction_ID', 'Date', 'Customer_Name', 'Region', 'Category', 'Units', 'Unit_Price', 'Total_Revenue', 'Payment_Status'],
        totalRows: 6,
        rows: [
          { Transaction_ID: 'TXN-1001', Date: '2024-01-12', Customer_Name: 'Apex Logistics Corp', Region: 'North', Category: 'Hardware', Units: 45, Unit_Price: 120.5, Total_Revenue: 5422.5, Payment_Status: 'Completed' },
          { Transaction_ID: 'TXN-1002', Date: '2024-01-18', Customer_Name: 'BioHealth Labs', Region: 'South', Category: 'Supplies', Units: 120, Unit_Price: 42.0, Total_Revenue: 5040.0, Payment_Status: 'Completed' },
          { Transaction_ID: 'TXN-1003', Date: '2024-02-05', Customer_Name: 'Zenith Retailers', Region: 'West', Category: 'Electronics', Units: 30, Unit_Price: 350.0, Total_Revenue: 10500.0, Payment_Status: 'Pending' },
          { Transaction_ID: 'TXN-1004', Date: '2024-02-22', Customer_Name: 'Solaria Solar Systems', Region: 'East', Category: 'Industrial', Units: 80, Unit_Price: 215.75, Total_Revenue: 17260.0, Payment_Status: 'Completed' },
          { Transaction_ID: 'TXN-1005', Date: '2024-03-10', Customer_Name: 'Quantum Infotech', Region: 'North', Category: 'Hardware', Units: 55, Unit_Price: 120.5, Total_Revenue: 6627.5, Payment_Status: 'Completed' },
          { Transaction_ID: 'TXN-1006', Date: '2024-03-29', Customer_Name: 'Metro Urban Rail', Region: 'Central', Category: 'Engineering', Units: 15, Unit_Price: 890.0, Total_Revenue: 13350.0, Payment_Status: 'Completed' },
        ],
      },
    },
    file2: {
      name: 'Sales_Report_Q2_2024.xlsx',
      sheet: {
        name: 'Q2_Sales',
        columns: ['Transaction_ID', 'Sales_Date', 'Client', 'Region', 'Category', 'Units_Sold', 'Unit_Rate', 'Gross_Amount', 'Status'],
        totalRows: 6,
        rows: [
          { Transaction_ID: 'TXN-2001', Sales_Date: '04/05/2024', Client: 'Vanguard Dynamics', Region: 'South', Category: 'Hardware', Units_Sold: 60, Unit_Rate: 125.0, Gross_Amount: 7500.0, Status: 'Completed' },
          { Transaction_ID: 'TXN-2002', Sales_Date: '04/19/2024', Client: 'BioHealth Labs', Region: 'South', Category: 'Supplies', Units_Sold: 95, Unit_Rate: 42.0, Gross_Amount: 3990.0, Status: 'Completed' },
          { Transaction_ID: 'TXN-2003', Sales_Date: '05/02/2024', Client: 'Pioneer Global Agro', Region: 'West', Category: 'Industrial', Units_Sold: 110, Unit_Rate: 180.25, Gross_Amount: 19827.5, Status: 'Pending' },
          { Transaction_ID: 'TXN-2004', Sales_Date: '05/21/2024', Client: 'Solaria Solar Systems', Region: 'East', Category: 'Industrial', Units_Sold: 40, Unit_Rate: 215.75, Gross_Amount: 8630.0, Status: 'Completed' },
          { Transaction_ID: 'TXN-2005', Sales_Date: '06/11/2024', Client: 'Evergreen Textiles', Region: 'Central', Category: 'Apparel', Units_Sold: 250, Unit_Rate: 28.5, Gross_Amount: 7125.0, Status: 'Completed' },
          { Transaction_ID: 'TXN-2006', Sales_Date: '06/30/2024', Client: 'AeroTech Avionics', Region: 'North', Category: 'Electronics', Units_Sold: 35, Unit_Rate: 490.0, Gross_Amount: 17150.0, Status: 'Completed' },
        ],
      },
    },
  },
];
