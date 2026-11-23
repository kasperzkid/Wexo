import React, { useState } from 'react';
import { Send, GitPullRequest, Globe, FileText, X } from 'lucide-react';
import { Task } from '../../types';

interface SubmitWorkModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitWork: (
    taskId: string,
    submission: {
      pullRequestUrl?: string;
      liveDemoUrl?: string;
      deliverableNotes: string;
      proofAttachmentHash?: string;
    }
  ) => Promise<unknown>;
}

export const SubmitWorkModal: React.FC<SubmitWorkModalProps> = ({
  task,
  isOpen,
  onClose,
  onSubmitWork,
}) => {
  const [prUrl, setPrUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [proofHash, setProofHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide deliverable notes explaining your completed work.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmitWork(task.id, {
        pullRequestUrl: prUrl.trim() || undefined,
        liveDemoUrl: demoUrl.trim() || undefined,
        deliverableNotes: notes.trim(),
        proofAttachmentHash: proofHash.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit work');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60">
      <div
        className="max-w-lg w-full rounded-2xl p-6 bg-white"
        style={{ border: '2px solid #0D0D0D', boxShadow: '6px 6px 0px #0D0D0D' }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-ink/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-500 shadow-brutal-sm flex items-center justify-center text-orange-600">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-ink">Submit Completed Work</h3>
              <p className="text-xs text-ink-faint font-semibold">Task #{task.onChainId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-faint hover:text-ink p-1 rounded-lg hover:bg-paper-gray transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-500 text-xs text-red-700 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-ink mb-1.5 flex items-center gap-1.5">
              <GitPullRequest className="w-3.5 h-3.5" />
              GitHub Pull Request or Repository URL
            </label>
            <input
              type="url"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="https://github.com/org/repo/pull/123"
              className="brutalist-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-ink mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Live Demo or Preview Link (Optional)
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://preview.app.xyz"
              className="brutalist-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-ink mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Deliverable Notes & Verification Proof *
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail what was built, test coverage, deployment steps, and verification proofs..."
              className="brutalist-input text-xs resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-ink mb-1.5">
              IPFS CID or Artifact Hash (Optional)
            </label>
            <input
              type="text"
              value={proofHash}
              onChange={(e) => setProofHash(e.target.value)}
              placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
              className="brutalist-input text-xs font-mono"
            />
          </div>

          <div className="pt-3 border-t border-ink/10 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-black px-5 py-2.5 text-xs"
              style={{ background: '#FF9933', color: '#0D0D0D', borderColor: '#0D0D0D' }}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Deliverables
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
