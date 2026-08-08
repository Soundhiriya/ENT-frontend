    // MedicineDetailsScreen.tsx

    import { MedicineDto } from "@/src/types/consultationtypes";
    import React, { useEffect, useState } from "react";
    import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    } from "@dnd-kit/core";
    import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
    } from "@dnd-kit/sortable";
    import { CSS } from "@dnd-kit/utilities";
    import { GripVertical, Pill } from "lucide-react";
    import { toast } from "sonner";
    import { getMedicineMasterData, MedicineDropdown, searchMedicines } from "@/src/services/masterservices";

    interface MedicineDetailsScreenProps {
    medicines: MedicineDto[];
    setMedicines: React.Dispatch<React.SetStateAction<MedicineDto[]>>;
    }

    interface SortableMedicineRowProps {
    id: string;
    med: MedicineDto;
    index: number;
    onRemove: (index: number) => void;
    }

    export const FREQUENCIES = [
    "1-0-0", // Morning
    "0-1-0", // Afternoon
    "0-0-1", // Night
    "1-0-1", // Morning + Night
    "1-1-0", // Morning + Afternoon
    "0-1-1", // Afternoon + Night
    "1-1-1", // Three times daily
    "1-1-1-1", // Four times daily
    "SOS", // As needed
    ];
    export const DOSAGES = [
    "½ Tablet",
    "1 Tablet",
    "2 Tablets",
    "5 ml",
    "10 ml",
    "15 ml",
    "1 Drop",
    "2 Drops",
];
export const DURATIONS = [
    "3 Days",
    "5 Days",
    "7 Days",
    "10 Days",
    "14 Days",
    "21 Days",
    "1 Month",
];
export const INSTRUCTIONS = [
    "Before Food",
    "After Food",
    "With Food",
    "Empty Stomach",
    "At Bedtime",
];

    const SortableMedicineRow = ({ id, med, index, onRemove }: SortableMedicineRowProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        backgroundColor: isDragging ? "#eff6ff" : undefined,
    };

    return (
        <tr ref={setNodeRef} style={style} className="border-b border-slate-100 text-sm">
        <td className="p-1.5 text-center">
            <button
            type="button"
            {...attributes}
            {...listeners}
            className="inline-flex cursor-grab touch-none items-center justify-center text-slate-400 hover:text-slate-600 active:cursor-grabbing"
            aria-label="Drag to reorder medicine"
            >
            <GripVertical className="h-4 w-4" />
            </button>
        </td>
        <td className="p-1.5">{med.medicineName}</td>
        <td className="p-1.5">{med.dosage}</td>
        <td className="p-1.5">{med.frequency}</td>
        <td className="p-1.5">{med.duration}</td>
        <td className="p-1.5">{med.instructions}</td>
        <td className="p-1.5 text-center">
            <button
            className="text-xs font-medium text-red-600 hover:text-red-700"
            onClick={() => onRemove(index)}
            >
            Remove
            </button>
        </td>
        </tr>
    );
    };

    const MedicineDetailsScreen = ({ medicines, setMedicines }: MedicineDetailsScreenProps) => {
    const [medicine, setMedicine] = useState<MedicineDto>({
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
    });

    const [medicineSuggestions, setMedicineSuggestions] = useState<MedicineDropdown[]>([]);

    const handleSearch = async (value: string) => {
        setMedicine((prev) => ({ ...prev, medicineName: value }));

        if (value.trim().length < 2) {
        setMedicineSuggestions([]);
        return;
        }

        try {
        const response = await searchMedicines(value);
        setMedicineSuggestions(response);
        } catch (error: any) {
        toast.error(error);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
        activationConstraint: { distance: 4 },
        })
    );

    const addMedicine = () => {
        if (!medicine.medicineName.trim()) return;

        setMedicines((prev) => [...prev, medicine]);

        setMedicine({
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        });
    };

    const removeMedicine = (index: number) => {
        setMedicines((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = Number(active.id);
        const newIndex = Number(over.id);

        setMedicines((prev) => arrayMove(prev, oldIndex, newIndex));
    };

    const sortableIds = medicines.map((_, index) => index.toString());

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Pill className="h-3.5 w-3.5" />
            Medicines
        </h2>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
                <div className="relative">
            <input
                type="text"
                placeholder="Search medicine..."
                value={medicine.medicineName}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {medicineSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-200 bg-white text-sm shadow-lg">
                {medicineSuggestions.map((item) => (
                    <div
                    key={item.id}
                    onClick={() => {
                        setMedicine((prev) => ({ ...prev, medicineName: item.medicineName }));
                        setMedicineSuggestions([]);
                    }}
                    className="cursor-pointer px-2 py-1.5 hover:bg-slate-100"
                    >
                    {item.medicineName}
                    </div>
                ))}
                </div>
            )}
            </div>

            <input
    list="dosage-options"
    value={medicine.dosage}
    onChange={(e) =>
        setMedicine((prev) => ({
            ...prev,
            dosage: e.target.value,
        }))
    }
    placeholder="Dosage"
    className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
/>

<datalist id="dosage-options">
    {DOSAGES.map((item) => (
        <option key={item} value={item} />
    ))}
</datalist>


            <input
        list="frequency-options"
        value={medicine.frequency}
        onChange={(e) =>
            setMedicine((prev) => ({
                ...prev,
                frequency: e.target.value,
            }))
        }
        placeholder="Frequency"
        className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />

    <datalist id="frequency-options">
        {FREQUENCIES.map((item) => (
            <option key={item} value={item} />
        ))}
    </datalist>
            

            <input
    list="duration-options"
    value={medicine.duration}
    onChange={(e) =>
        setMedicine((prev) => ({
            ...prev,
            duration: e.target.value,
        }))
    }
    placeholder="Duration"
    className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
/>

<datalist id="duration-options">
    {DURATIONS.map((item) => (
        <option key={item} value={item} />
    ))}
</datalist>

<input
    list="instruction-options"
    value={medicine.instructions}
    onChange={(e) =>
        setMedicine((prev) => ({
            ...prev,
            instructions: e.target.value,
        }))
    }
    placeholder="Instructions"
    className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
/>

<datalist id="instruction-options">
    {INSTRUCTIONS.map((item) => (
        <option key={item} value={item} />
    ))}
</datalist>

        </div>

        <button
            type="button"
            onClick={addMedicine}
            className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
            Add Medicine
        </button>

        {medicines.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                        <th className="p-1.5 text-center font-medium">Drag</th>
                        <th className="p-1.5 text-left font-medium">Medicine</th>
                        <th className="p-1.5 text-left font-medium">Dosage</th>
                        <th className="p-1.5 text-left font-medium">Frequency</th>
                        <th className="p-1.5 text-left font-medium">Duration</th>
                        <th className="p-1.5 text-left font-medium">Instructions</th>
                        <th className="p-1.5 text-center font-medium">Action</th>
                    </tr>
                    </thead>

                    <tbody>
                    {medicines.map((med, index) => (
                        <SortableMedicineRow
                        key={index}
                        id={index.toString()}
                        med={med}
                        index={index}
                        onRemove={removeMedicine}
                        />
                    ))}
                    </tbody>
                </table>
                </SortableContext>
            </DndContext>
            </div>
        )}
        </div>
    );
    };

    export default MedicineDetailsScreen;