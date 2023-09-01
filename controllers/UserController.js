import sha1 from 'sha1';
import dbClient from '../utils/db';

class UserController {
  // eslint-disable-next-line consistent-return
  static postNew(req, res) {
    console.log(req.body);
    const { email, password } = req.body;
    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });
    // eslint-disable-next-line consistent-return
    dbClient.doesUserExist({ email }).then((user) => {
      if (user) return res.status(400).send({ error: 'Already exist' });
      const hasedPassword = sha1(password);
      dbClient
        .createUser({ email, hasedPassword })
        .then((user) => res.status(201).send({ id: user.insertedId, email }));
    });
  }
}

export default UserController;
