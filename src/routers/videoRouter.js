import express from "express"
import {
    getVideoEdit,
    videoWatch,
    postVideoEdit,
    getUploadVideo,
    postUploadVideo,
    deleteVideo
} from "../controllers/videoController";
import { protectorMiddleware } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get('/:id([0-9a-f]{24})', videoWatch);
videoRouter.route('/:id([0-9a-f]{24})/edit').all(protectorMiddleware).get(getVideoEdit).post(postVideoEdit);
videoRouter.get('/:id([0-9a-f]{24})/delete',deleteVideo).all(protectorMiddleware)
videoRouter.route('/upload').all(protectorMiddleware).get(getUploadVideo).post(postUploadVideo);

export default videoRouter;