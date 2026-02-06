import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen } from 'lucide-react';
import { useGetPublishedBlogPosts } from '../hooks/useQueries';

export default function DashboardPublishedBlogList() {
  const { data: blogPosts, isLoading } = useGetPublishedBlogPosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
          <p className="text-muted-foreground">Check back soon for updates and news!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {blogPosts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {post.media && (
            <div className="w-full h-48 overflow-hidden bg-muted">
              <img
                src={post.media.getDirectURL()}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(Number(post.timestamp / BigInt(1000000))).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <CardTitle className="text-xl">{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap line-clamp-3">{post.content}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
