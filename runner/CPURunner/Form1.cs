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

namespace CPURunner
{
    public partial class Form1 : Form
    {
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

            var trackMemory = new[] {0, 1000, 1001, 1002, 1003, 1004, 3000, 4000, 3001, 4001, 3002, 4002, 3003, 4003, 3004, 4004, 3005, 4005, 3006, 4006};
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
    }
}
