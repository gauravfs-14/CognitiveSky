import { MessageSquare } from "lucide-react"
import { PageTitle } from "@/components/page-title"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PostsLoading() {
  return (
    <>
      <PageTitle title="Posts" description="Browse all mental health posts" icon={<MessageSquare size={28} />} />

      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-6 w-full" />
              </CardFooter>
            </Card>
          ))}
      </div>
    </>
  )
}
