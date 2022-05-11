import { addCommentToIssue, createIssue, searchIssue, createLabel } from 'modules/Github/api';

export const addService = async ({
  destination,
  name,
  documentType,
  json,
  url,
}: {
  destination: string;
  name: string;
  documentType: string;
  json: any;
  url: string;
}) => {
  if (!destination) {
    return {};
  }
  const [githubOrganization, githubRepository] = (destination || '')?.split('/');

  const commonParams = {
    owner: githubOrganization,
    repo: githubRepository,
    accept: 'application/vnd.github.v3+json',
  };

  const { origin } = new URL(url);

  const issueTitle = `Add ${name} - ${documentType}`;
  const issueBodyCommon = `
You can see the work done by the awesome contributor here:
${url}

Or on your local:
${url.replace(origin, 'http://localhost:3000')}

Or you can see the JSON generated here:
\`\`\`json
${JSON.stringify(json, null, 2)}
\`\`\`

You will need to create the following file in the root of the project: \`services/${name.trimEnd()}.json\`

`;
  const labelName = process.env.GITHUB_LABEL_ADD || 'add';

  await createLabel({
    ...commonParams,
    name: labelName,
    description: 'Automatically created by Open Terms Archive Contribution Tool',
    color: 'C2E0C6',
  });

  let existingIssue = await searchIssue({
    ...commonParams,
    title: issueTitle,
  });

  if (existingIssue) {
    await addCommentToIssue({
      ...commonParams,
      issue_number: existingIssue.number,
      body: `
Addition has been requested again through the contribution tool

${issueBodyCommon}
`,
    });
  } else {
    existingIssue = await createIssue({
      ...commonParams,
      title: issueTitle,
      body: `
New service addition requested through the contribution tool

${issueBodyCommon}
`,
      labels: [labelName],
    });
  }

  return existingIssue;
};