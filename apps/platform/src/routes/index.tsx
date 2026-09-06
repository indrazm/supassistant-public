import { createFileRoute } from "@tanstack/react-router";
import { PostsList } from "../components/PostsList";

export const Route = createFileRoute("/")({
  component: PostsList,
});
