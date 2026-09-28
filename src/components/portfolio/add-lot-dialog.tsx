import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Fund, HoldingKind } from "@/lib/funds/types";
import { addLot } from "@/lib/server/portfolio";

export function AddLotDialog({
  funds,
  presetFundId,
}: {
  funds: Fund[];
  presetFundId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [fundId, setFundId] = useState(presetFundId ?? funds[0]?.id ?? "");
  const [units, setUnits] = useState("10");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("2025-01-15");
  const [kind, setKind] = useState<HoldingKind>("buy");
  const qc = useQueryClient();
  const selected = funds.find((f) => f.id === fundId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add holding</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a lot</DialogTitle>
          <DialogDescription>
            Manual tracking only — Meridian does not connect to a brokerage.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await addLot({
                data: {
                  fundId,
                  units: Number(units),
                  costPerUnit: Number(price || selected?.nav || 0),
                  purchasedAt: date,
                  kind,
                },
              });
              void qc.invalidateQueries({ queryKey: ["portfolio"] });
              toast.success("Holding added");
              setOpen(false);
            } catch {
              toast.error("Could not add holding. Sign in first.");
            }
          }}
        >
          <div className="space-y-1.5">
            <Label>Fund</Label>
            <Select value={fundId} onValueChange={setFundId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {funds.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.ticker} — {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="units">Units</Label>
              <Input
                id="units"
                inputMode="decimal"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price / unit</Label>
              <Input
                id="price"
                inputMode="decimal"
                placeholder={selected ? String(selected.nav) : ""}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Purchase date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as HoldingKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Lump sum</SelectItem>
                  <SelectItem value="sip">SIP / contribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Save lot
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
