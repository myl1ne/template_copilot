using System.Collections.Generic;
using RimWorld;
using Verse;
using Verse.AI;

namespace TowerDefenseMod.Towers
{
    public class WorkGiver_UpgradeTower : WorkGiver_DoBill
    {
        public override Job JobOnThing(Pawn pawn, Thing thing, bool forced = false)
        {
            // Use default bill job logic
            Job job = base.JobOnThing(pawn, thing, forced);
            return job;
        }

        public override bool HasJobOnThing(Pawn pawn, Thing t, bool forced = false)
        {
            // Check if the building has bills that need doing
            IBillGiver billGiver = t as IBillGiver;
            if (billGiver == null || !billGiver.CurrentlyUsableForBills())
                return false;

            if (!billGiver.BillStack.AnyShouldDoNow)
                return false;

            return base.HasJobOnThing(pawn, t, forced);
        }
    }
}
