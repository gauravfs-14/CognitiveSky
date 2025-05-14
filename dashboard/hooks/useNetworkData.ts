"use client";

import { useState, useEffect } from "react";

export interface NetworkNode {
  id: string;
  group: number;
  posts: number;
  label?: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  value?: number;
}

export function useNetworkData() {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the real data
        const [nodesResponse, linksResponse, topUsersResponse] =
          await Promise.all([
            fetch("/data/graph_nodes.json"),
            fetch("/data/graph_edges.json"),
            fetch("/data/top_users.json"),
          ]);

        if (!nodesResponse.ok || !linksResponse.ok) {
          throw new Error("Failed to fetch network data");
        }

        const rawNodes: NetworkNode[] = await nodesResponse.json();
        const rawLinks: NetworkLink[] = await linksResponse.json();
        const topUsersData = topUsersResponse.ok
          ? await topUsersResponse.json()
          : [];

        // Create a map of did to post count for quick lookup
        const didToCountMap = new Map<string, number>();
        topUsersData.forEach((user: { authorDid: string; count: number }) => {
          didToCountMap.set(user.authorDid, user.count);
        });

        // Process nodes to add labels - truncate DIDs for better display
        const processedNodes = rawNodes.map((node) => {
          const shortId = node.id.substring(8, 16) + "...";
          // Use the real post count if available from top users, otherwise use the node posts count
          const posts = didToCountMap.get(node.id) || node.posts;
          return {
            ...node,
            label: shortId,
            posts,
          };
        });

        // Filter nodes to limit size for better performance
        let filteredNodes = processedNodes;

        // Limit to top 300 nodes for performance
        const maxNodes = 300;
        if (processedNodes.length > maxNodes) {
          // Sort by posts count (descending)
          filteredNodes = processedNodes
            .sort((a, b) => b.posts - a.posts)
            .slice(0, maxNodes);
        }

        // Create a set of node IDs that we're keeping
        const nodeIdSet = new Set(filteredNodes.map((node) => node.id));

        // Filter links to only include connections between our filtered nodes
        const filteredLinks = rawLinks.filter(
          (link) =>
            nodeIdSet.has(link.source as string) &&
            nodeIdSet.has(link.target as string)
        );

        // Add value property to links based on community size if missing
        const enhancedLinks = filteredLinks.map((link) => ({
          ...link,
          value: link.value || 1,
        }));

        setNodes(filteredNodes);
        setLinks(enhancedLinks);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching network data:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { nodes, links, loading, error };
}
