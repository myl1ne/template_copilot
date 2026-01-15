using RimWorld;
using Verse;

namespace TowerDefenseMod.Waves
{
    public class WaveMapComponent : MapComponent
    {
        public int WaveIndex = 0;
        public float DifficultyMultiplier = 1.0f;
        public bool WaveQueued = false;
        public int LastWaveTick = -999999;

        // Base wave parameters
        private const float BasePoints = 150f;
        private const float PointsPerWave = 60f;

        public WaveMapComponent(Map map) : base(map)
        {
        }

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Values.Look(ref WaveIndex, "waveIndex", 0);
            Scribe_Values.Look(ref DifficultyMultiplier, "difficultyMultiplier", 1.0f);
            Scribe_Values.Look(ref WaveQueued, "waveQueued", false);
            Scribe_Values.Look(ref LastWaveTick, "lastWaveTick", -999999);
        }

        public void StartNextWave()
        {
            if (map == null)
            {
                Log.Error("[Tower Defense] Cannot start wave - map is null");
                return;
            }

            WaveIndex++;
            LastWaveTick = Find.TickManager.TicksGame;
            
            float points = BasePoints + (WaveIndex * PointsPerWave);
            
            Log.Message($"[Tower Defense] Starting Wave {WaveIndex} with {points} points");

            // Create incident parameters
            IncidentParms parms = StorytellerUtility.DefaultParmsNow(IncidentCategoryDefOf.ThreatBig, map);
            parms.forced = true;
            parms.points = points * DifficultyMultiplier;

            // Try to execute the wave incident
            IncidentDef incidentDef = DefDatabase<IncidentDef>.GetNamed("TD_WaveRaid", false);
            if (incidentDef != null)
            {
                incidentDef.Worker.TryExecute(parms);
            }
            else
            {
                Log.Error("[Tower Defense] TD_WaveRaid incident def not found!");
            }
        }
    }
}
