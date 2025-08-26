import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ExternalLink, Heart, MessageCircle, Repeat2, BadgeCheck, Clock, TrendingUp, Filter, RefreshCw, Globe, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: { name: string };
  author?: string;
  content: string;
}

interface SocialPost {
  id: string;
  username: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: number;
  verified: boolean;
  avatar?: string;
  url?: string;
  currencies: string[];
}

export default function News() {
  const [newsCategory, setNewsCategory] = useState("cryptocurrency");
  const [socialPage, setSocialPage] = useState(1);
  const [socialFilter, setSocialFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("news");
  const socialLimit = 18; // Grid layout with 18 posts per page
  
  // Fetch crypto news
  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['/api/news', newsCategory],
    queryFn: () => fetch(`/api/news?category=${newsCategory}`).then(res => res.json()),
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 240000, // Consider stale after 4 minutes
  });

  // Fetch social feed with pagination and filtering
  const { data: socialData, isLoading: socialLoading } = useQuery({
    queryKey: ['/api/social-feed', socialPage, socialFilter],
    queryFn: () => fetch(`/api/social-feed?page=${socialPage}&limit=${socialLimit}&filter=${socialFilter}`).then(res => res.json()),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const NewsCard = ({ article }: { article: NewsArticle }) => (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-white/10 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                {article.description}
              </p>
            </div>
            {article.urlToImage && (
              <img 
                src={article.urlToImage} 
                alt={article.title}
                className="w-20 h-20 rounded-lg object-cover ml-4 flex-shrink-0 ring-1 ring-white/20"
              />
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatTimeAgo(article.publishedAt)}</span>
              </span>
              <BadgeComponent variant="secondary" className="text-xs bg-white/10 text-gray-300 border-white/20">
                {article.source.name}
              </BadgeComponent>
              {article.author && <span className="text-gray-500">• {article.author}</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
              onClick={() => window.open(article.url, '_blank')}
              data-testid={`news-link-${article.id}`}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Read
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SocialPostCard = ({ post }: { post: SocialPost }) => (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-2xl hover:bg-white/8 transition-all duration-300 h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20 flex-shrink-0">
            {post.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-1">
              <span className="font-semibold text-white text-sm truncate">{post.username}</span>
              {post.verified && <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <span className="truncate">{post.handle}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.timestamp)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <p className="text-gray-200 text-sm leading-relaxed mb-3 flex-1">
            {post.content}
          </p>
          
          {post.currencies.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.currencies.slice(0, 3).map((currency) => (
                <BadgeComponent
                  key={currency}
                  variant="outline"
                  className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10"
                >
                  ${currency}
                </BadgeComponent>
              ))}
              {post.currencies.length > 3 && (
                <BadgeComponent
                  variant="outline"
                  className="text-xs border-gray-500/30 text-gray-400 bg-gray-500/10"
                >
                  +{post.currencies.length - 3}
                </BadgeComponent>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-gray-400 text-xs mt-auto">
            <div className="flex items-center space-x-3">
              <button 
                className="flex items-center space-x-1 hover:text-gray-300 hover:bg-white/10 rounded-full px-1 py-1 transition-all"
                data-testid={`post-comment-${post.id}`}
              >
                <MessageCircle className="w-3 h-3" />
                <span>{post.comments}</span>
              </button>
              <button 
                className="flex items-center space-x-1 hover:text-green-400 hover:bg-green-500/20 rounded-full px-1 py-1 transition-all"
                data-testid={`post-retweet-${post.id}`}
              >
                <Repeat2 className="w-3 h-3" />
                <span>{post.retweets}</span>
              </button>
              <button 
                className="flex items-center space-x-1 hover:text-red-400 hover:bg-red-500/20 rounded-full px-1 py-1 transition-all"
                data-testid={`post-like-${post.id}`}
              >
                <Heart className="w-3 h-3" />
                <span>{post.likes}</span>
              </button>
            </div>
            {post.url && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300 p-1 h-auto"
                onClick={() => window.open(post.url, '_blank')}
                data-testid={`post-link-${post.id}`}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto" data-testid="news-page">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-2">
              Crypto News & Social Feed
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Stay updated with the latest cryptocurrency news, market analysis, and social sentiment from the crypto community.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>Multiple Sources</span>
              </div>
              <div className="flex items-center space-x-1">
                <RefreshCw className="w-4 h-4" />
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Social Sentiment</span>
              </div>
            </div>
          </div>
        </div>

        {/* News & Social Tabs */}
        <Tabs defaultValue="news" className="w-full" onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
              <TabsTrigger value="news" className="flex items-center space-x-2 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4" />
                <span>News</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center space-x-2 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <MessageCircle className="w-4 h-4" />
                <span>Social Feed</span>
              </TabsTrigger>
            </TabsList>

            {/* Unified Filter System */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {activeTab === "news" ? (
                <Select value={newsCategory} onValueChange={setNewsCategory}>
                  <SelectTrigger className="w-48 bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-xl border-white/10 shadow-2xl">
                    <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                    <SelectItem value="defi">DeFi</SelectItem>
                    <SelectItem value="nft">NFT</SelectItem>
                    <SelectItem value="web3">Web3</SelectItem>
                    <SelectItem value="altcoin">Altcoins</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select value={socialFilter} onValueChange={(value) => {
                  setSocialFilter(value);
                  setSocialPage(1);
                }}>
                  <SelectTrigger className="w-48 bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-xl border-white/10 shadow-2xl">
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="twitter">X/Twitter Only</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="defi">DeFi</SelectItem>
                    <SelectItem value="nft">NFT</SelectItem>
                    <SelectItem value="web3">Web3</SelectItem>
                    <SelectItem value="altcoins">Altcoins</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <TabsContent value="news" className="space-y-6">
            {newsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-3 bg-white/10 rounded w-full"></div>
                        <div className="h-3 bg-white/10 rounded w-2/3"></div>
                        <div className="h-3 bg-white/10 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {newsData?.articles?.map((article: NewsArticle) => (
                  <NewsCard key={article.id || article.url} article={article} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-6">

            {socialLoading ? (
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {[...Array(socialLimit)].map((_, i) => (
                    <Card key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex space-x-3">
                          <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-white/10 rounded w-1/4"></div>
                            <div className="h-3 bg-white/10 rounded w-full"></div>
                            <div className="h-3 bg-white/10 rounded w-3/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                {/* Grid Layout for Social Posts - 3 columns responsive */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {socialData?.posts?.map((post: SocialPost) => (
                    <SocialPostCard key={post.id} post={post} />
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {socialData?.pagination && socialData.pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-4">
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSocialPage(prev => Math.max(1, prev - 1))}
                            disabled={!socialData.pagination.hasPrevious}
                            className="text-white hover:bg-white/10 disabled:opacity-50"
                            data-testid="social-page-previous"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <span>Page</span>
                            <span className="font-semibold text-white">{socialData.pagination.currentPage}</span>
                            <span>of</span>
                            <span className="font-semibold text-white">{socialData.pagination.totalPages}</span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSocialPage(prev => prev + 1)}
                            disabled={!socialData.pagination.hasNext}
                            className="text-white hover:bg-white/10 disabled:opacity-50"
                            data-testid="social-page-next"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-400 text-center">
                          Showing {socialData.posts?.length || 0} of {socialData.pagination.totalPosts} posts
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {newsData?.articles?.length || 0}
              </div>
              <div className="text-sm text-gray-400">News Articles</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {socialData?.pagination?.totalPosts || socialData?.posts?.length || 0}
              </div>
              <div className="text-sm text-gray-400">Social Posts</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-sm text-gray-400">Live Updates</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-xl font-bold text-white mb-2">
                {newsCategory.charAt(0).toUpperCase() + newsCategory.slice(1)}
              </div>
              <div className="text-sm text-gray-400">Category</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}