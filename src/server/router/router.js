import express from 'express';
import serverSideRender from '@server/controllers/serverSideRender';
import generateThumbnail from '@server/controllers/generateThumbnail';

const router = express.Router();

router.get('/thumbnail/:src.:ext', generateThumbnail);
router.get('*', serverSideRender);

export default router;
