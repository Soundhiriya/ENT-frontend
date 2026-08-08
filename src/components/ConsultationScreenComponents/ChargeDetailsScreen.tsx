// ChargeDetailsScreen.tsx

import { ChargeDto } from "@/src/types/consultationtypes";
import { Receipt } from "lucide-react";
import React, { useState } from "react";

interface ChargeDetailsScreenProps {
    consultationFee: string;
    setConsultationFee: React.Dispatch<React.SetStateAction<string>>;
    charges: ChargeDto[];
    setCharges: React.Dispatch<React.SetStateAction<ChargeDto[]>>;
}

const ChargeDetailsScreen = ({
    consultationFee,
    setConsultationFee,
    charges,
    setCharges,
}: ChargeDetailsScreenProps) => {
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState("");

    const addCharge = () => {
        if (!label.trim() || !amount.trim() || Number(amount) < 0) return;

        setCharges((prev) => [
            ...prev,
            { label: label.trim(), amount: Number(amount) },
        ]);

        setLabel("");
        setAmount("");
    };

    const removeCharge = (index: number) => {
        setCharges((prev) => prev.filter((_, i) => i !== index));
    };

    const additionalTotal = charges.reduce((sum, c) => sum + c.amount, 0);
    const grandTotal = additionalTotal + (Number(consultationFee) || 0);

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Receipt className="h-3.5 w-3.5" />
                Charges
            </h2>

            {/* Consultation Fee — always present, name fixed, amount editable */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px]">
                <div className="flex h-8 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-sm font-medium text-slate-700">
                    Consultation Fee
                </div>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    placeholder="Amount"
                    className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="my-3 border-t border-slate-100" />

            <p className="mb-1.5 text-xs font-medium text-slate-500">
                Additional Charges
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_auto]">
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Charge name (e.g. Injection Fee)"
                    className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addCharge();
                        }
                    }}
                />

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addCharge();
                        }
                    }}
                />

                <button
                    type="button"
                    onClick={addCharge}
                    className="h-8 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                >
                    Add Charge
                </button>
            </div>

            {charges.length > 0 && (
                <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                                <th className="p-1.5 text-left font-medium">Charge</th>
                                <th className="p-1.5 text-right font-medium">Amount</th>
                                <th className="p-1.5 text-center font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {charges.map((charge, index) => (
                                <tr key={index} className="border-b border-slate-100">
                                    <td className="p-1.5">{charge.label}</td>
                                    <td className="p-1.5 text-right">{charge.amount.toFixed(2)}</td>
                                    <td className="p-1.5 text-center">
                                        <button
                                            type="button"
                                            className="text-xs font-medium text-red-600 hover:text-red-700"
                                            onClick={() => removeCharge(index)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr>
                                <td className="p-1.5 text-right text-xs font-semibold text-slate-500">
                                    Subtotal
                                </td>
                                <td className="p-1.5 text-right text-sm font-semibold text-slate-800">
                                    {additionalTotal.toFixed(2)}
                                </td>
                                <td />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                </span>
                <span className="text-sm font-semibold text-slate-800">
                    {grandTotal.toFixed(2)}
                </span>
            </div>
        </div>
    );
};

export default ChargeDetailsScreen;
