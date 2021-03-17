import { ERRORS } from '../constants/errors';
import { Post } from '../models/Post';
import { User } from '../models/User';
export default class SocialService {
  // ======================================== POSTS ========================================
  public static async createPost(
    accountId: string,
    post: {
      content: string, 
    }
  ): Promise<Post> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    
    const { content } = post;

    const newPost = new Post({
      accountId,
      content
    });

    await newPost.save();
    
    return newPost;
  }

}