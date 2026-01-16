using System.Collections.Generic;
using RimWorld;
using Verse;

namespace TowerDefenseMod.Towers
{
    public class Building_TowerBillGiver : Building_WorkTable
    {
        public override void Notify_BillDeleted(Bill bill)
        {
            base.Notify_BillDeleted(bill);
        }

        // Override to perform upgrade after bill completes
        public override void UsedThisTick()
        {
            base.UsedThisTick();
        }

        public override IEnumerable<Gizmo> GetGizmos()
        {
            foreach (Gizmo gizmo in base.GetGizmos())
            {
                yield return gizmo;
            }
        }
    }
}
