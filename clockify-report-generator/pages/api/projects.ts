// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

type Data = {
  name: string
}

type Project = {
  name: string,
  id: string,
  color: string
}

const checkError = (error: any, res: NextApiResponse) => {
  switch (error.response.status) {
    case 401:
      res.status(401).send('Unauthorized');
      break;
    default:
      console.log(error);
      res.status(500).send('Internal Server Error');
      break;
  }
};

const getProjects = async (defaultWorkspace: string, CLOCKIFY_API_KEY: string): Promise<Project[]> => {
  const response = await axios.get(`https://api.clockify.me/api/v1/workspaces/${defaultWorkspace}/projects`, {
    headers: {
      'X-Api-Key': CLOCKIFY_API_KEY
    }
  })
  if (response.status === 200) {
    return response.data.map((project: any) => {
      return {
        name: project.name,
        id: project.id,
        color: project.color
      }
    })
  }
  return [];
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.headers['x-api-key'] === undefined) {
    res.status(400).send('CLOCKIFY_API_KEY is required');
    return;
  }

  const CLOCKIFY_API_KEY = req.headers['x-api-key'] as string;

  axios.get('https://api.clockify.me/api/v1/user', {
    headers: {
      'X-Api-Key': CLOCKIFY_API_KEY
    }
  }).then(response => {
    if (response.data.defaultWorkspace) {
      const name = response.data.name;
      getProjects(response.data.defaultWorkspace, CLOCKIFY_API_KEY).then(projects => {
        if (projects.length > 0) {
          res.status(200).json({ name, projects })
        } else {
          res.status(404).send('No projects found');
        }
      }).catch(error => {
        checkError(error, res);
      });

    } else {
      res.status(400).send("No Default Workspace");
    }
  }).catch(error => {
    checkError(error, res);
  });
}