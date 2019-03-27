import express from 'express'
import serverSideRender from '@server/controllers/serverSideRender'

const router = express.Router()

router.get('*', serverSideRender)

export default router
