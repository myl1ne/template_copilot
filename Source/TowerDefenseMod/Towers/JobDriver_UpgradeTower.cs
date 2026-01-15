using System.Collections.Generic;
using RimWorld;
using Verse;
using Verse.AI;

namespace TowerDefenseMod.Towers
{
    public class JobDriver_UpgradeTower : JobDriver
    {
        private Building_WorkTable Tower => (Building_WorkTable)job.GetTarget(TargetIndex.A).Thing;
        private Bill Bill => job.bill;

        public override bool TryMakePreToilReservations(bool errorOnFailed)
        {
            return pawn.Reserve(Tower, job, 1, -1, null, errorOnFailed);
        }

        protected override IEnumerable<Toil> MakeNewToils()
        {
            // Fail if tower is destroyed
            this.FailOnDestroyedOrNull(TargetIndex.A);
            this.FailOnForbidden(TargetIndex.A);

            // Go to tower
            yield return Toils_Goto.GotoThing(TargetIndex.A, PathEndMode.InteractionCell);

            // Do the work
            Toil work = new Toil();
            work.initAction = delegate
            {
                job.bill.Notify_DoBillStarted(pawn);
            };
            work.tickAction = delegate
            {
                pawn.skills.Learn(SkillDefOf.Construction, 0.1f);
                job.bill.Notify_PawnDidWork(pawn);
            };
            work.defaultCompleteMode = ToilCompleteMode.Never;
            work.WithEffect(EffecterDefOf.ConstructMetal, TargetIndex.A);
            work.PlaySustainerOrSound(() => SoundDefOf.Building_Complete);
            work.WithProgressBar(TargetIndex.A, () => job.bill.GetWorkDone() / job.bill.recipe.workAmount, false, -0.5f);
            work.FailOn(() => job.bill.suspended);
            work.activeSkill = () => SkillDefOf.Construction;
            yield return work.WithEffect(EffecterDefOf.ConstructMetal, TargetIndex.A);

            // Complete the upgrade
            Toil complete = new Toil();
            complete.initAction = delegate
            {
                // Perform the actual upgrade
                if (Tower != null && Tower.def.defName == "TD_Tower_Mk1")
                {
                    TowerUpgradeUtility.UpgradeTower(Tower, "TD_Tower_Mk2");
                }
            };
            complete.defaultCompleteMode = ToilCompleteMode.Instant;
            yield return complete;
        }

        public override void ExposeData()
        {
            base.ExposeData();
        }
    }
}
