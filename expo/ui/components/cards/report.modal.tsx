import { Button } from "@ui/button";
import { Camera, ImageIcon, Info, TShirt } from "@ui/icons";
import { MenuGroup, MenuItem, MenuItemCheck } from "@ui/menu";
import { Modal, ModalHeader } from "@ui/modal";
import { useMemo, useState } from "react";

export type ReportConfig = {
  generationId?: string;
  outfitId?: string;
  presetId?: string;
  itemId?: string;
  onReport: (data: {
    reason: string;
    generationId?: string;
    outfitId?: string;
    presetId?: string;
    itemId?: string;
  }) => void;
  onBlock?: () => void;
};

type Props = {
  open: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
  report?: ReportConfig;
};

const REASONS = [
  "Spam or misleading",
  "Harassment or bullying",
  "Hate speech or symbols",
  "Nudity or sexual content",
  "Violence or dangerous organizations",
  "I just don't like it"
];

export const ReportModal = ({ open, onComplete, onCancel, report }: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const availableOptions = useMemo(() => {
    if (!report) return [];
    return [
      // ...(report.userId ? [{ id: "reportedUserId", label: "The user who posted this", icon: User }] : []),
      ...(report.generationId ? [{ id: "generationId", label: "This content", icon: Camera }] : []),
      ...(report.outfitId ? [{ id: "outfitId", label: "This outfit", icon: TShirt }] : []),
      ...(report.presetId ? [{ id: "presetId", label: "This preset", icon: ImageIcon }] : []),
      ...(report.itemId ? [{ id: "itemId", label: "This item", icon: ImageIcon }] : []),
    ];
  }, [report]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleReport = (reason: string) => {
    if (!report) return;

    onComplete?.();

    report.onReport({
      reason,
      generationId: selectedIds.includes("generationId") ? report.generationId : undefined,
      outfitId: selectedIds.includes("outfitId") ? report.outfitId : undefined,
      presetId: selectedIds.includes("presetId") ? report.presetId : undefined,
      itemId: selectedIds.includes("itemId") ? report.itemId : undefined,
    });
  };

  if (!report) return null;

  const isStep1 = step === 1 && availableOptions.length > 1;

  return (
    <Modal open={open} onOpenChange={(v) => { if (!v) onCancel?.(); }}>
      <ModalHeader
        onBack={() => {
          if (!isStep1) setStep(1)
          else onCancel?.()
        }}
        title={
          isStep1 ?
            "What do you want to report?" : "Why are you reporting this?"
        }
      />
      {isStep1 && (
        <>
          <MenuGroup>
            {availableOptions.map(option => (
              <MenuItemCheck
                key={option.id}
                icon={option.icon as any}
                text={option.label}
                selected={selectedIds.includes(option.id)}
                onPress={() => toggleSelection(option.id)}
                variant="destructive"
              />
            ))}
          </MenuGroup>
          <Button
            variant="destructive"
            disabled={selectedIds.length === 0}
            style={{ marginBottom: 12 }}
            onPress={() => setStep(2)}
          >
            Continue
          </Button>
        </>
      )}
      {!isStep1 && (
        <MenuGroup>
          {REASONS.map(reason => (
            <MenuItem
              icon={Info}
              key={reason}
              text={reason}
              onPress={() => {
                if (availableOptions.length <= 1 && availableOptions[0]) {
                  // Auto-select the only option if skipping step 1
                  if (!selectedIds.includes(availableOptions[0].id)) {
                    selectedIds.push(availableOptions[0].id);
                  }
                }
                handleReport(reason);
              }}
            />
          ))}
        </MenuGroup>
      )}
    </Modal>
  );
};
