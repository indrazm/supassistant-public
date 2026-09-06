import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Button } from "@superassistant/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@superassistant/ui/components/dialog";
import { Input } from "@superassistant/ui/components/input";

type IngestResponse = {
  jobId: string;
  documentId: string;
};

async function requestIngest(url: string): Promise<IngestResponse> {
  const response = await fetch("/api/ingest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error ?? `Ingest failed (HTTP ${response.status})`);
  }
  return body as IngestResponse;
}

export function IngestDocumentButton() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const ingest = useMutation({
    mutationFn: requestIngest,
    onSuccess: () => setUrl(""),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = url.trim();
    if (trimmed.length > 0) {
      ingest.mutate(trimmed);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) ingest.reset();
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Ingest document</DialogTrigger>
      <DialogContent>
        <form className="grid gap-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Ingest document</DialogTitle>
            <DialogDescription>
              Fetch a web page and index it as a knowledge graph (Neo4j) and vector search (Qdrant).
              Re-ingesting a URL replaces its previous version.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="url"
            required
            placeholder="https://example.com/article"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          {ingest.isError && <p className="text-destructive text-sm">{ingest.error.message}</p>}
          {ingest.isSuccess && (
            <p className="text-sm">
              Queued for ingestion (job {ingest.data.jobId}). The worker fetches, chunks, embeds,
              and indexes the page.
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={ingest.isPending || url.trim().length === 0}>
              {ingest.isPending ? "Ingesting…" : "Ingest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
