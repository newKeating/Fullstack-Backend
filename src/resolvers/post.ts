import {
  Arg,
  Int,
  Mutation,
  Query,
  Resolver,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import session from "express-session";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  // posts(@Ctx() ctx: MyContext): Promise<Post[]> {
  posts(): Promise<Post[]> {
    // return ctx.em.find(Post, {});
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number
    // @Ctx() { em }: MyContext
  ): Promise<Post | undefined> {
    // return em.findOne(Post, { id });
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    // const post = em.create(Post, { title });
    // await em.persistAndFlush(post);
    // return post;
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
    // @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    // const post = await em.findOne(Post, { id });
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      // post.title = title;
      // await em.persistAndFlush(post);
      await Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number
    // @Ctx() { em }: MyContext
  ): Promise<boolean> {
    // await em.nativeDelete(Post, { id });
    await Post.delete(id);
    return true;
  }
}
