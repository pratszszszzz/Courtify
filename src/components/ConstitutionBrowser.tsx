import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Scale, Users, Shield, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConstitutionArticle {
  id: string;
  number: string;
  title: string;
  part: string;
  category: 'fundamental-rights' | 'directive-principles' | 'fundamental-duties' | 'government' | 'judiciary' | 'other';
  content: string;
  keyPoints: string[];
}

const mockArticles: ConstitutionArticle[] = [
  {
    id: '14',
    number: 'Article 14',
    title: 'Equality before law',
    part: 'Part III - Fundamental Rights',
    category: 'fundamental-rights',
    content: 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.',
    keyPoints: [
      'Guarantees equality before law for all persons',
      'Prohibits discrimination by the State',
      'Ensures equal protection under the law',
      'Applies to both citizens and non-citizens'
    ]
  },
  {
    id: '19',
    number: 'Article 19',
    title: 'Protection of certain rights regarding freedom of speech, etc.',
    part: 'Part III - Fundamental Rights',
    category: 'fundamental-rights',
    content: 'All citizens shall have the right to freedom of speech and expression; to assemble peaceably and without arms; to form associations or unions; to move freely throughout the territory of India; to reside and settle in any part of the territory of India; and to practise any profession, or to carry on any occupation, trade or business.',
    keyPoints: [
      'Freedom of speech and expression',
      'Right to peaceful assembly',
      'Freedom of association',
      'Right to movement and residence',
      'Freedom of profession and occupation'
    ]
  },
  {
    id: '21',
    number: 'Article 21',
    title: 'Protection of life and personal liberty',
    part: 'Part III - Fundamental Rights',
    category: 'fundamental-rights',
    content: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.',
    keyPoints: [
      'Right to life and personal liberty',
      'Protection against arbitrary deprivation',
      'Due process requirement',
      'Expanded interpretation by Supreme Court'
    ]
  },
  {
    id: '38',
    number: 'Article 38',
    title: 'State to secure a social order for the promotion of welfare of the people',
    part: 'Part IV - Directive Principles of State Policy',
    category: 'directive-principles',
    content: 'The State shall strive to promote the welfare of the people by securing and protecting as effectively as it may a social order in which justice, social, economic and political, shall inform all the institutions of the national life.',
    keyPoints: [
      'Promotion of social welfare',
      'Social, economic, and political justice',
      'Guidance for State policy',
      'Not enforceable in courts'
    ]
  },
  {
    id: '51a',
    number: 'Article 51A',
    title: 'Fundamental duties',
    part: 'Part IV-A - Fundamental Duties',
    category: 'fundamental-duties',
    content: 'It shall be the duty of every citizen of India to abide by the Constitution and respect its ideals and institutions, the National Flag and the National Anthem.',
    keyPoints: [
      'Constitutional duties of citizens',
      'Respect for Constitution and institutions',
      'Respect for national symbols',
      'Added by 42nd Amendment in 1976'
    ]
  },
  {
    id: '72',
    number: 'Article 72',
    title: 'Power of President to grant pardons, etc., and to suspend, remit or commute sentences in certain cases',
    part: 'Part V - The Union',
    category: 'government',
    content: 'The President shall have the power to grant pardons, reprieves, respites or remissions of punishment or to suspend, remit or commute the sentence of any person convicted of any offence.',
    keyPoints: [
      'Presidential power of pardon',
      'Applies to all types of sentences',
      'Discretionary power',
      'Cannot be questioned in courts'
    ]
  }
];

const ConstitutionBrowser = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<ConstitutionArticle | null>(null);

  const categories = [
    { id: 'all', label: 'All Articles', icon: BookOpen, color: 'bg-primary' },
    { id: 'fundamental-rights', label: 'Fundamental Rights', icon: Shield, color: 'bg-success' },
    { id: 'directive-principles', label: 'Directive Principles', icon: Users, color: 'bg-warning' },
    { id: 'fundamental-duties', label: 'Fundamental Duties', icon: Scale, color: 'bg-accent' },
    { id: 'government', label: 'Government', icon: Gavel, color: 'bg-secondary' },
  ];

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="constitution-section" className="py-20 bg-gradient-to-br from-muted to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-primary mb-4">
            Indian Constitution Browser
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore and search through the articles of the Indian Constitution
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search */}
              <Card className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </Card>

              {/* Categories */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          selectedCategory === category.id && "bg-primary hover:bg-primary-light"
                        )}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.label}
                      </Button>
                    );
                  })}
                </div>
              </Card>

              {/* Results Count */}
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {filteredArticles.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Articles found
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedArticle ? (
                /* Article Detail View */
                <Card className="p-8 legal-shadow">
                  <div className="mb-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedArticle(null)}
                      className="mb-4"
                    >
                      ← Back to Articles
                    </Button>
                    
                    <div className="space-y-2">
                      <Badge variant="secondary">{selectedArticle.part}</Badge>
                      <h1 className="text-3xl font-heading font-bold text-primary">
                        {selectedArticle.number}
                      </h1>
                      <h2 className="text-xl text-muted-foreground">
                        {selectedArticle.title}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Article Text</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="leading-relaxed text-foreground">
                          {selectedArticle.content}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Points</h3>
                      <div className="grid gap-3">
                        {selectedArticle.keyPoints.map((point, index) => (
                          <div 
                            key={index}
                            className="flex items-start p-3 bg-card border rounded-lg"
                          >
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0" />
                            <p className="text-sm">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                /* Article List View */
                <div className="space-y-4">
                  {filteredArticles.length === 0 ? (
                    <Card className="p-12 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search terms or category filter.
                      </p>
                    </Card>
                  ) : (
                    filteredArticles.map((article) => (
                      <Card 
                        key={article.id}
                        className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-transparent hover:border-l-accent"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-primary mb-1">
                              {article.number}
                            </h3>
                            <p className="text-muted-foreground">
                              {article.title}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {article.part}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {article.content}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {article.keyPoints.slice(0, 2).map((point, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {point}
                            </Badge>
                          ))}
                          {article.keyPoints.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{article.keyPoints.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConstitutionBrowser;