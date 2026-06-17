import type { MechanismType } from "@/types";

type MechanismSelectorProps = {
  selectedMechanism: MechanismType;
  onChange: (mechanism: MechanismType) => void;
};

export function MechanismSelector({ selectedMechanism, onChange }: MechanismSelectorProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Mechanism Type</h2>
      <select className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={selectedMechanism} onChange={(event) => onChange(event.target.value as MechanismType)}>
        <option value="four_bar">Four-bar linkage</option>
        <option value="slider_crank">Slider-crank</option>
      </select>
    </div>
  );
}
