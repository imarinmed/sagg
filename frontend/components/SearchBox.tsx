"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input, Card, Chip, Button, Spinner } from "@heroui/react";
import { X, Search } from "lucide-react";
import { api } from "@/lib/api";

interface SearchResult {
  id: string;
  type: "episode" | "character" | "scene" | "mythos";
  title: string;
  snippet: string;
  url: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

interface SearchBoxProps {
  placeholder?: string;
  maxResults?: number;
}

const typeColors: Record<SearchResult["type"], "default" | "accent" | "success" | "warning" | "danger"> = {
  episode: "accent",
  character: "success",
  scene: "warning",
  mythos: "default",
};

export function SearchBox({ placeholder = "Search...", maxResults = 10 }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.search.query(debouncedQuery);
        setResults(response.results.slice(0, maxResults));
        setIsOpen(true);
      } catch (err) {
        setError("Failed to search");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, maxResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setIsOpen(false);
    setError(null);
    inputRef.current?.focus();
  };

  const hasResults = results.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (hasResults) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pr-10"
          variant="secondary"
          aria-label="Search"
          aria-expanded={isOpen}
          aria-controls={isOpen ? "search-results" : undefined}
          aria-activedescendant={isOpen && hasResults ? "search-result-0" : undefined}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Spinner size="sm" color="current" />
          ) : query ? (
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onPress={handleClear}
              aria-label="Clear search"
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Search className="h-4 w-4 text-muted" />
          )}
        </div>
      </div>

      {isOpen && (
        <Card
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto"
          variant="default"
          role="listbox"
          aria-label="Search results"
        >
          {error ? (
            <div className="p-4 text-center text-danger">
              <p className="text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setDebouncedQuery(debouncedQuery)}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : !hasResults && debouncedQuery ? (
            <div className="p-4 text-center text-muted">
              <p className="text-sm">No results found for &quot;{debouncedQuery}&quot;</p>
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  id={`search-result-${index}`}
                  role="option"
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-3 hover:bg-surface-secondary transition-colors focus:bg-surface-secondary focus:outline-none"
                >
                  <div className="flex items-start gap-3">
                    <Chip
                      size="sm"
                      color={typeColors[result.type]}
                      variant="soft"
                      className="shrink-0 capitalize"
                    >
                      {result.type}
                    </Chip>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {result.title}
                      </p>
                      {result.snippet && (
                        <p className="text-sm text-muted line-clamp-2 mt-0.5">
                          {result.snippet}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
