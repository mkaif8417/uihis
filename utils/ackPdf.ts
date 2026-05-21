import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type AckPdfProps = {
  registrationId: string;
  applicantName: string;
  relationName: string;
  applicantType: string;
  applicantCategory: string;
  componentType: string;
  component: string;
  subComponent: string;
  cropItem: string;
  landArea: string;
  surveyNo: string;
  generatedOn: string;
};

export const generateAcknowledgementPDF = async ({
  registrationId,
  applicantName,
  relationName,
  applicantType,
  applicantCategory,
  componentType,
  component,
  subComponent,
  cropItem,
  landArea,
  surveyNo,
  generatedOn,
}: AckPdfProps) => {
  const html = `
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          padding: 24px;
          color: #000;
        }

        .title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 6px;
        }

        .subtitle {
          text-align: center;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 15px;
          font-weight: bold;
          margin-top: 20px;
          margin-bottom: 8px;
          border-bottom: 1px solid #333;
          padding-bottom: 4px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }

        td {
          border: 1px solid #444;
          padding: 8px;
          font-size: 13px;
        }

        td.label {
          width: 35%;
          font-weight: bold;
          background-color: #f2f2f2;
        }

        .footer {
          margin-top: 32px;
          font-size: 12px;
          text-align: center;
          color: #444;
        }

        .note {
          margin-top: 16px;
          font-size: 12px;
          background-color: #f9f9f9;
          padding: 10px;
          border: 1px dashed #666;
        }
      </style>
    </head>

    <body>
      <div class="title">
        Application Acknowledgement For Registration and Scheme Filing
      </div>
      <div class="subtitle">
        State : Haryana
      </div>

      <div class="section-title">Applicant Details</div>
      <table>
        <tr>
          <td class="label">Registration ID</td>
          <td>${registrationId}</td>
        </tr>
        <tr>
          <td class="label">Applicant Name</td>
          <td>${applicantName}</td>
        </tr>
        <tr>
          <td class="label">Relation Name</td>
          <td>S/O - ${relationName}</td>
        </tr>
        <tr>
          <td class="label">Applicant Type</td>
          <td>${applicantType}</td>
        </tr>
        <tr>
          <td class="label">Applicant Category</td>
          <td>${applicantCategory}</td>
        </tr>
      </table>

      <div class="section-title">Scheme Details</div>
      <table>
        <tr>
          <td class="label">Component Type</td>
          <td>${componentType}</td>
        </tr>
        <tr>
          <td class="label">Component</td>
          <td>${component}</td>
        </tr>
        <tr>
          <td class="label">Sub Component</td>
          <td>${subComponent}</td>
        </tr>
        <tr>
          <td class="label">Crop / Item</td>
          <td>${cropItem}</td>
        </tr>
        <tr>
          <td class="label">Land Area</td>
          <td>${landArea}</td>
        </tr>
        <tr>
          <td class="label">Survey Number</td>
          <td>${surveyNo}</td>
        </tr>
      </table>

      <div class="note">
        Please retain this acknowledgement for future reference.
        This acknowledgement does not guarantee sanction of subsidy.
      </div>

      <div class="footer">
        Generated on ${generatedOn} <br />
        This is a system-generated acknowledgement and does not require a signature.
      </div>
    </body>
  </html>
  `;

  const file = await Print.printToFileAsync({
    html,
    base64: false,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri);
  }
};