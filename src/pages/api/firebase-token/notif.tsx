import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }

  const { github_id, firebase_uid, user_gh_access_token, pub_key } = req.body;

  await axios
    .post('https://api-v1.defi-os.com/user/setup', {
      github_id,
      firebase_uid,
      user_gh_access_token,
      pub_key,
    })
    .then((response) => {
      res.status(200).send(response.data);
    })
    .catch((error) => {
      res.status(400).send({ message: error.message });
    });
}
