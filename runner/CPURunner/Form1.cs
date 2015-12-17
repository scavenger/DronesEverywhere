using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CPURunner
{
    public partial class Form1 : Form
    {
        int START_IDX;
        int ROWS;
        int COLS;
        int X;
        int Y;
        int TX;
        int TY;
        int NR_OBSTACOLE;
        int NR_CETATENI;
        int NR_DRONE;
        int OFFSET = 1400;

        public Form1()
        {
            InitializeComponent();
        }

        private void ParseFile(string path)
        {
            var lines = File.ReadLines(path).ToArray();
            var memory = Enumerable.Range(0, 5000).Select(x => 0).ToArray();
            int A = 0, N = 0;
            int lineCnt = 0;
            var address = 0;

            int completeRuns = 0;

            var trackMemory = new[] { 0, 1000, 1001, 1002, 1003, 1004, 3000, 4000, 3001, 4001, 3002, 4002, 3003, 4003, 3004, 4004, 3005, 4005, 3006, 4006 };
            long instructions = 0;

            while (true)
            {
                var res = lines[lineCnt].Split(new[] { ' ' }, StringSplitOptions.None);
                var token = res[0];
                var value = res.Length > 1 ? res[1] : "";
                var hasAddress = false;
                var skipIt = false;
                int newLineCnt = lineCnt;

                if (instructions > 200)
                {
                    return;
                }
                instructions++;

                if (value.Contains("["))
                {
                    address = value.Contains("N") ? N : Convert.ToInt32(value.Substring(1, value.Length - 2));
                    hasAddress = true;
                }

                switch (token)
                {
                    case "NOP":
                        break;
                    case "LDA":
                        A = hasAddress ? memory[address] : Convert.ToInt32(value);
                        break;
                    case "JGE":
                        if (A >= 0)
                        {
                            lineCnt = Convert.ToInt32(value);
                            skipIt = true;
                        }
                        break;
                    case "STA":
                        if (hasAddress)
                        {
                            memory[address] = A;
                        }
                        break;
                    case "LDN":
                        N = hasAddress ? memory[address] : Convert.ToInt32(value);
                        break;
                    case "ADDA":
                        if (hasAddress)
                        {
                            A += Convert.ToInt32(memory[address]);
                        }
                        else
                            A += Convert.ToInt32(value);
                        break;
                    case "SUBA":
                        if (hasAddress)
                        {
                            A -= Convert.ToInt32(memory[address]);
                        }
                        else
                            A -= Convert.ToInt32(value);
                        break;
                    case "HLT":
                        lineCnt = 0;
                        skipIt = true;
                        completeRuns++;
                        if (completeRuns > 5)
                        {
                            return;
                        }
                        tbConsole.Text += string.Format("{0}---------------------------------------{0}", Environment.NewLine);
                        break;
                    default:
                        tbConsole.Text += string.Format("{0}: ERROR: {1}{2}", lineCnt, lines[lineCnt], Environment.NewLine);
                        break;
                }

                var memoryMap = trackMemory.Aggregate("", (current, mapLocation) => current + string.Format("{0,4} ", memory[mapLocation]));
                tbConsole.Text += string.Format("{0,5}: A = {1,5}, N = {2,5}, \t\t{3,15}\t\t{5}{4}", newLineCnt, A, N, lines[newLineCnt], Environment.NewLine, memoryMap);

                if (!skipIt)
                {
                    lineCnt++;
                    if (lineCnt == lines.Length)
                    {
                        lineCnt = 0;
                    }
                }
            }
        }

        private void btnLoadIt_Click(object sender, EventArgs e)
        {
            this.ParseFile(@"Z:\Volumes\data\WORK\Sublime\amazon2015\output\04_gottaCircleAround.txt");
        }

        private void SolveMap(string dataSetPath)
        {
            const int cmdHOLD = 0, cmdUP = 1, cmdRIGHT = 2, cmdDOWN = 3, cmdLEFT = 4;
            int currentCmd = -1;

            var lines = File.ReadAllText(dataSetPath);
            dynamic inputData = JsonConvert.DeserializeObject(File.ReadAllText(dataSetPath));

            var memory = Enumerable.Repeat(0, 5000).ToList();

            dynamic objects = inputData.map.objects.Children();

            var obstaclesList = new List<MapObject>();
            var cetateniList = new List<MapObject>();
            var dronesList = new List<MapObject>();
            foreach (var o in objects)
            {
                var mapObject = new MapObject()
                {
                    X = o.position.x,
                    Y = o.position.y
                };

                if (o.type == "Obstacle")
                {
                    obstaclesList.Add(mapObject);
                }
                else if (o.type == "Cetatean")
                {
                    cetateniList.Add(mapObject);
                }
                else
                {
                    dronesList.Add(mapObject);
                }
            }

            START_IDX = 0;
            ROWS = START_IDX++;
            COLS = START_IDX++;
            X = START_IDX++;
            Y = START_IDX++;
            TX = START_IDX++;
            TY = START_IDX++;
            NR_OBSTACOLE = START_IDX++;
            NR_CETATENI = NR_OBSTACOLE + 1 + 2 * obstaclesList.Count();
            NR_DRONE = NR_CETATENI + 1 + 2 * cetateniList.Count();
            OFFSET = 1400;

            var sb = new StringBuilder();

            memory[ROWS] = Convert.ToInt32(inputData.map.rows.Value);
            sb.AppendLine(string.Format("{0}: {1} // ROWS", ROWS, memory[ROWS]));
            memory[COLS] = Convert.ToInt32(inputData.map.cols.Value);
            sb.AppendLine(string.Format("{0}: {1} // COLS", COLS, memory[COLS]));
            memory[X] = Convert.ToInt32(inputData.simulatedDrone.position.x);
            sb.AppendLine(string.Format("{0}: {1} // X", X, memory[X]));
            memory[Y] = Convert.ToInt32(inputData.simulatedDrone.position.y);
            sb.AppendLine(string.Format("{0}: {1} // Y", Y, memory[Y]));
            memory[TX] = Convert.ToInt32(inputData.map.target.x);
            sb.AppendLine(string.Format("{0}: {1} // TX", TX, memory[TX]));
            memory[TY] = Convert.ToInt32(inputData.map.target.y);
            sb.AppendLine(string.Format("{0}: {1} // TY", TY, memory[TY]));

            memory[NR_OBSTACOLE] = obstaclesList.Count();
            sb.AppendLine(string.Format("{0}: {1} // NR_OBSTACOLE", NR_OBSTACOLE, memory[NR_OBSTACOLE]));
            for (int i = 0; i < memory[NR_OBSTACOLE]; i++)
            {
                var idx = NR_OBSTACOLE + 1 + 2*i;
                memory[idx] = obstaclesList[i].X;
                sb.AppendLine(string.Format("{0}: {1} // NR_OBSTACOLE{2}_X", idx, memory[idx], i));
                memory[++idx] = obstaclesList[i].Y;
                sb.AppendLine(string.Format("{0}: {1} // NR_OBSTACOLE{2}_Y", idx, memory[idx], i));
            }

            memory[NR_CETATENI] = cetateniList.Count();
            sb.AppendLine(string.Format("{0}: {1} // NR_CETATENI", NR_CETATENI, memory[NR_CETATENI]));
            for (int i = 0; i < memory[NR_CETATENI]; i++)
            {
                var idx = NR_CETATENI + 1 + 2 * i;
                memory[idx] = cetateniList[i].X;
                sb.AppendLine(string.Format("{0}: {1} // NR_CETATENI{2}_X", idx, memory[idx], i));
                memory[++idx] = cetateniList[i].Y;
                sb.AppendLine(string.Format("{0}: {1} // NR_CETATENI{2}_Y", idx, memory[idx], i));
            }

            memory[NR_DRONE] = dronesList.Count();
            sb.AppendLine(string.Format("{0}: {1} // NR_DRONE", NR_DRONE, memory[NR_DRONE]));
            for (int i = 0; i < memory[NR_DRONE]; i++)
            {
                var idx = NR_DRONE + 1 + 2 * i;
                memory[idx] = dronesList[i].X;
                sb.AppendLine(string.Format("{0}: {1} // NR_DRONE{2}_X", idx, memory[idx], i));
                memory[++idx] = dronesList[i].Y;
                sb.AppendLine(string.Format("{0}: {1} // NR_DRONE{2}_Y", idx, memory[idx], i));
            }

            //var output = sb.ToString();

            var allPath = new List<MapObject>();
            for (var steps = 0; steps < 2500; steps++)
            {
                var neighbors = GetNeightbors(memory[X], memory[Y]);

                // 1. check against fixed obstacles
                foreach (var obstacle in obstaclesList)
                {
                    var node = neighbors.FirstOrDefault(n => n.X == obstacle.X && n.Y == obstacle.Y);
                    if (node != null)
                    {
                        node.Blocked = true;
                        if (CheckIfAllBlocked(neighbors))
                        {
                            break;
                        }
                    }
                }

                // 2. check against cetateni
                foreach (var cetatean in cetateniList)
                {
                    var blockedZone = new List<MapObject>();
                    for (int dx = -3; dx <= 3; dx++)
                    {
                        for (int dy = -3; dy <= 3; dy++)
                        {
                            blockedZone.Add(new MapObject()
                            {
                                X = cetatean.X + dx,
                                Y = cetatean.Y + dy
                            });
                        }
                    }

                    foreach (var bi in blockedZone)
                    {
                        var node = neighbors.FirstOrDefault(n => n.Blocked == false && n.X == cetatean.X && n.Y == cetatean.Y);
                        if (node != null)
                        {
                            node.Blocked = true;
                        }
                        if (CheckIfAllBlocked(neighbors))
                        {
                            break;
                        }                        
                    }
                }
                
                if (CheckIfAllBlocked(neighbors))
                {
                    currentCmd = cmdHOLD;
                    allPath.Add(allPath[allPath.Count() - 1]);
                }
                else
                {
                    foreach (var n in neighbors)
                    {
                        n.Distance = GetDistance(n.X, n.Y, memory[TX], memory[TY]);
                    }
                    var nextNode = neighbors.OrderBy(n => n.Distance).First();
                    allPath.Add(nextNode);
                    
                    memory[X] = nextNode.X;
                    memory[Y] = nextNode.Y;

                    if (nextNode.Distance == 0)
                    {
                        break;
                    }
                }

                ActualizareCetateni(memory);
            }

            sb = new StringBuilder();
            int k = 1;
            foreach (var node in allPath)
            {
                sb.AppendLine(string.Format("{0}({1},{2})", k, node.X, node.Y));
                k++;
            }

            var path = sb.ToString();
        }

        private void ActualizareCetateni(List<int> memory)
        {
            memory[NR_CETATENI + 1] -= 1;
        }

        private bool CheckIfAllBlocked(IEnumerable<MapObject> list)
        {
            return list.Any(n => n.Blocked == false) == false;
        }
        
        private int GetDistance(int x1, int y1, int x2, int y2)
        {
            return Math.Abs(x2 - x1) + Math.Abs(y2 - y1);
        }

        private List<MapObject> GetNeightbors(int x, int y)
        {
            var list = new List<MapObject>();
            for (int dx = -1; dx <= 1; dx++)
            {
                for (int dy = -1; dy <= 1; dy++)
                {
                    //if (dx != dy)
                    //{
                        list.Add(new MapObject()
                        {
                            X = x + dx,
                            Y = y + dy,
                            Blocked = false,
                            Distance = Int32.MaxValue
                        });
                    //}
                }
            }
            return list;
        }

        private void btnSolve_Click(object sender, EventArgs e)
        {
            SolveMap(@"C:\Users\cristianmi\Documents\DronesEverywhere\data\04_gottaCircleAround.txt");            
        }

        public class MapObject
        {
            public int X { get; set; }
            public int Y { get; set; }
            public bool Blocked { get; set; }
            public int Distance { get; set; }
        }
    }
}
