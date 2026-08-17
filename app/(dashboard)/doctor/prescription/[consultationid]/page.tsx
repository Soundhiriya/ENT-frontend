"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPrescription } from "@/src/services/prescriptionservice";
import { PrescriptionDto } from "@/src/types/prescription";
import PrescriptionView from "@/src/components/PrescriptionView";
import { RoleGaurd } from "@/src/security/RoleGuard";

export default function PrescriptionPage() {
  const params = useParams();
  const consultationId = Number(params.consultationid);

  const [prescription, setPrescription] =
    useState<PrescriptionDto | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrescription = async () => {
      try {
        const data = await getPrescription(consultationId);
        setPrescription(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(consultationId)) {
      loadPrescription();
    }
  }, [consultationId]);

  if (loading) {
    return (
      <RoleGaurd allowed={["ADMIN", "DOCTOR"]}>
        <div className="flex h-screen items-center justify-center">
          Loading Prescription...
        </div>
      </RoleGaurd>
    );
  }

  if (!prescription) {
    return (
      <RoleGaurd allowed={["ADMIN", "DOCTOR"]}>
        <div className="flex h-screen items-center justify-center">
          Prescription not found.
        </div>
      </RoleGaurd>
    );
  }

  const prescriptionUrl = `${window.location.origin}/patient/prescription/${prescription.prescriptionToken}`;

  return (
    <RoleGaurd allowed={["ADMIN", "DOCTOR"]}>
      <div className="flex min-h-screen justify-center bg-slate-100 py-8 print:min-h-0 print:block print:bg-white print:py-0">
        {/* A4 print sizing — content is centered on screen and spans the
            full printable width; it's allowed to spill onto a 2nd page
            rather than being force-shrunk to fit one.

            The page-box margin reserves blank space for hospitals that
            print onto pre-printed letterhead paper (logo/header and
            address/footer already printed on the physical sheet). It's
            declared on @page rather than on a wrapper element because a
            page margin repeats on EVERY page, whereas an element margin
            applies once — so a prescription that spills onto page 2 would
            otherwise start at the top of the sheet and collide with the
            pre-printed header. The trade-off is that content is anchored
            to the top of the band instead of vertically centered, which
            is the conventional prescription-pad look anyway.

            TO RETUNE FOR A DIFFERENT LETTERHEAD: change only the two
            --print-header-h / --print-footer-h values below. Measure the
            pre-printed sheet with a ruler — header band is normally the
            taller of the two — and note that only the VERTICAL extent
            matters here: a wide header is already cleared because content
            starts below it, so widening it needs no change. The side
            margins are separate (10mm each).

            Current values leave a 225mm usable band (297 - 60 - 12).
            These are provisional — set by visual inspection, not a ruler —
            pending measurement of the physical letterhead.

            Careful when lowering this band further: a 4-medicine
            prescription measures ~224mm, so 225mm clears it by barely a
            millimetre. Drop below ~224mm and that tier spills to a second
            page, because the ~24mm QR footer block can't be split.

            The var() indirection is used rather than literals so there's a
            single named knob per band; Chrome does resolve custom
            properties inside @page (verified), and the inline fallbacks
            keep the margins correct on any engine that doesn't, instead of
            collapsing them to zero. */}
        <style>{`
          @media print {
            :root {
              --print-header-h: 60mm;
              --print-footer-h: 12mm;
            }

            @page {
              size: A4;
              margin: var(--print-header-h, 60mm) 10mm
                      var(--print-footer-h, 12mm) 10mm;
            }

            /* Next.js dev-mode indicator — only present when running
               next dev, never in a production build, but hide it
               defensively just in case. */
            nextjs-portal {
              display: none !important;
            }
          }
        `}</style>

        <PrescriptionView
          data={prescription}
          prescriptionUrl={prescriptionUrl}
          onPrint={() => window.print()}
        />
      </div>
    </RoleGaurd>
  );
}