import { db } from "@/src/db";
import { posts } from "@/src/db/schemas";
import { checkPermission } from "@/src/lib/auth/check-permission";
import { or, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  try {
    const { slugOrPostId } = params;

    const post = await db.query.posts.findFirst({
      where: or(eq(posts.slug, slugOrPostId), eq(posts.post_id, slugOrPostId)),
      columns: {
        author_id: false,
      },
      with: {
        featured_image: {
          columns: {
            url: true,
            alt_text: true,
            id: true,
            caption: true,
          },
        },
        category: {
          columns: {
            name: true,
            slug: true,
            id: true,
          },
        },
        author: {
          columns: {
            name: true,
            username: true,

            auth_id: true,
            avatar: true,
          },
        },
        tags: {
          with: {
            tag: {
              columns: {
                name: true,
                slug: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!post)
      return NextResponse.json(
        { data: null, message: "Post not found" },
        { status: 404 }
      );
    const tags = post.tags.length > 0 ? post.tags.map((t) => t.tag) : [];

    return NextResponse.json({
      data: { ...post, tags },
      message: "Post retrieved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: "Error retrieving post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  return await checkPermission("posts:edit", async () => {
    try {
      const { slugOrPostId } = params;
      const body = await req.json();
      const oldPost = await db.query.posts.findFirst({
        where: or(
          eq(posts.slug, slugOrPostId),
          eq(posts.post_id, slugOrPostId)
        ),
      });

      if (!oldPost)
        return NextResponse.json(
          {
            message: "Post not found",
          },
          { status: 404 }
        );

      await db
        .update(posts)
        .set({
          ...body,
          scheduled_at: body.scheduled_at ? new Date(body.scheduled_at) : null,
        })
        .where(
          or(eq(posts.slug, slugOrPostId), eq(posts.post_id, slugOrPostId))
        );
      const post = await db.query.posts.findFirst({
        where: or(
          eq(posts.slug, slugOrPostId),
          eq(posts.post_id, slugOrPostId)
        ),
        columns: {
          author_id: false,
        },
        with: {
          featured_image: {
            columns: {
              url: true,
              alt_text: true,
              id: true,
              caption: true,
            },
          },
          category: {
            columns: {
              name: true,
              slug: true,
              id: true,
            },
          },
          author: {
            columns: {
              name: true,
              username: true,

              auth_id: true,
              avatar: true,
            },
          },
          tags: {
            with: {
              tag: {
                columns: {
                  name: true,
                  slug: true,
                  id: true,
                },
              },
            },
          },
        },
      });
      const tags =
        post && post?.tags?.length > 0 ? post?.tags.map((t) => t.tag) : [];

      return NextResponse.json(
        {
          data: { ...post, tags },
          message: "Post updated successfully",
          lastUpdate: new Date().getTime(),
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.log("Error", error);

      return NextResponse.json(
        { data: null, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
