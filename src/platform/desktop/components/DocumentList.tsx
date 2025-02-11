import { FileText } from "lucide-react";
import { DocumentListInfo } from "../types/api";

interface Props {
  documents: DocumentListInfo[] | undefined;
  onSelect: (documentId: string) => void;
  selectedId?: string;
}

export function DocumentList({ documents, onSelect, selectedId }: Props) {

  console.log(documents)
  return (
    <div className="space-y-2">
      {documents &&
        documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`w-full flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
              selectedId === doc.id
                ? "bg-blue-50 text-blue-700"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{doc.filename}</div>
              <div className="text-xs text-gray-500">
                {new Date(doc.createdAt).toLocaleDateString()}
                {doc.chunks && ` • ${doc.chunks} chunks`}
                {doc.status && ` • ${doc.status}`}
              </div>
            </div>
          </button>
        ))}
    </div>
  );
}
