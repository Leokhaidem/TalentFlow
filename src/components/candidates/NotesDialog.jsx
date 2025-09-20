import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotesDialog({ candidate, isOpen, onClose, onSaveNote }) {
  const [newNote, setNewNote] = useState("");
  const [mentions, setMentions] = useState([]);

  const mentionSuggestions = [
    { id: 1, name: "John Smith", email: "john@company.com" },
    { id: 2, name: "Sarah Johnson", email: "sarah@company.com" },
    { id: 3, name: "Mike Davis", email: "mike@company.com" },
  ];

  useEffect(() => {
    if (!isOpen) {
      setNewNote("");
      setMentions([]);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!newNote.trim()) return;
    const noteObj = {
      id: `note-${Date.now()}`,
      content: newNote.trim(),
      mentions,
      timestamp: new Date().toISOString(),
      author: "Current User",
    };
    onSaveNote?.(candidate.id, noteObj);
    onClose?.();
  };

  const renderMentionSuggestions = () => {
    const atIndex = newNote.lastIndexOf("@");
    if (atIndex === -1 || atIndex < newNote.length - 20) return null;
    const searchTerm = newNote.slice(atIndex + 1).toLowerCase();
    const suggestions = mentionSuggestions.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.email.toLowerCase().includes(searchTerm)
    );
    if (suggestions.length === 0) return null;

    return (
      <div className="absolute bottom-full mb-2 w-full bg-white border rounded-md shadow-lg z-10">
        {suggestions.map((p) => (
          <div
            key={p.id}
            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => {
              const atIndexLocal = newNote.lastIndexOf("@");
              const before = newNote.slice(0, atIndexLocal);
              const after = newNote.slice(
                atIndexLocal + 1 + (newNote.length - (atIndexLocal + 1))
              );
              setNewNote(`${before}@${p.name}${after}`);
              setMentions((m) => [...m, p]);
            }}
          >
            <div className="font-medium">{p.name}</div>
            <div className="text-gray-500 text-xs">{p.email}</div>
          </div>
        ))}
      </div>
    );
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Notes for {candidate.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {candidate.notes && candidate.notes.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-medium">Previous Notes:</h4>
              {candidate.notes.map((note) => (
                <div
                  key={note.id || note.timestamp}
                  className="text-sm bg-gray-50 p-2 rounded"
                >
                  <p>{note.content}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {note.author} •{" "}
                    {new Date(note.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Textarea
              placeholder="Add a note... Use @ to mention team members"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px]"
            />
            {renderMentionSuggestions()}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!newNote.trim()}>
              Save Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
