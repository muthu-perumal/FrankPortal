// Sample subset of your "wFormId: 5" JSON.
// Replace this array with your full JSON response when ready.
export const formDefinition = [
  {
    id: 143091,
    name: 'Application Type',
    type: 'SINGLE_CHOICE',
    isMandatory: true,
    parentId: 0,
    validationJson:
      '{"validation":{},"specific":{"customOptions":["PURCHASE","REFINANCE","RENEWAL"]}}',
  },
  {
    id: 143092,
    name: 'Application',
    type: 'SINGLE_CHOICE',
    isMandatory: true,
    parentId: 0,
    validationJson:
      '{"validation":{},"specific":{"customOptions":["Short Application","Full Application"]}}',
  },
  {
    id: 143093,
    name: 'Application Name',
    type: 'SHORT_TEXT',
    isMandatory: true,
    parentId: 0,
    validationJson:
      '{"specific":{},"validation":{"contentRule":"ALPHA_DASH","maximum":"","minimum":""}}',
  },
  { id: 143106, name: 'First Name', type: 'SHORT_TEXT', isMandatory: true, parentId: 0 },
  { id: 143108, name: 'Last Name', type: 'SHORT_TEXT', isMandatory: true, parentId: 0 },
  { id: 143109, name: 'Date of Birth', type: 'DATE', isMandatory: true, parentId: 0 },
  { id: 143111, name: 'Phone number', type: 'PHONE_NUMBER', isMandatory: true, parentId: 0 },
  {
    id: 143112,
    name: 'Email',
    type: 'SHORT_TEXT',
    isMandatory: true,
    parentId: 0,
    validationJson: '{"specific":{},"validation":{"contentRule":"EMAIL"}}',
  },
  {
    id: 143135,
    name: 'Residence Type',
    type: 'SINGLE_CHOICE',
    isMandatory: true,
    parentId: 0,
    validationJson:
      '{"validation":{},"specific":{"customOptions":["Owned","Rent","Living with family"]}}',
  },
  {
    id: 143097,
    name: 'Would you like to add a co-applicant?',
    type: 'SINGLE_CHOICE',
    isMandatory: true,
    parentId: 0,
    validationJson: '{"validation":{},"specific":{"customOptions":["Yes","No"]}}',
  },
  {
    id: 143098,
    name: 'First Name (Co-Applicant)',
    type: 'SHORT_TEXT',
    isMandatory: true,
    parentId: 0,
  },
  {
    id: 143101,
    name: 'Co-Applicant Email',
    type: 'SHORT_TEXT',
    isMandatory: true,
    parentId: 0,
    validationJson: '{"specific":{},"validation":{"contentRule":"EMAIL"}}',
  },
  {
    id: 143348,
    name: 'Consent',
    type: 'MULTIPLE_CHOICE',
    isMandatory: true,
    parentId: 0,
    validationJson:
      '{"validation":{},"specific":{"customOptions":["I authorize Frank Mortgage to obtain my credit report","I agree to the Terms & Conditions and Privacy Policy","I certify that the information provided is accurate and complete"]}}',
  },
  {
    id: 143137,
    name: 'Prior Residential Address',
    type: 'TABLE',
    isMandatory: false,
    parentId: 0,
  },
  {
    id: 143138,
    name: 'Residential Address Line 1',
    type: 'SHORT_TEXT',
    isMandatory: true,
    parentId: 143137,
  },
  {
    id: 143142,
    name: 'Residential Postal Code',
    type: 'SHORT_TEXT',
    isMandatory: true,
    parentId: 143137,
  },
  {
    id: 143143,
    name: 'Residential Start_Date',
    type: 'DATE',
    isMandatory: true,
    parentId: 143137,
  },
  {
    id: 143144,
    name: 'Residential End_Date',
    type: 'DATE',
    isMandatory: true,
    parentId: 143137,
  },
]

