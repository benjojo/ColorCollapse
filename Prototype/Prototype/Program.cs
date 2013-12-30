using System;
using System.Drawing;

namespace Prototype
{
    class Program
    {
        static void Main(string[] args)
        {
            Image LoadedImg = Image.FromFile("sample.jpg");
            Bitmap LoadedBit = (Bitmap)LoadedImg;
            CIELab[,] px = new CIELab[LoadedImg.Width+1, LoadedImg.Height+1];

            for (int x = 0; x < LoadedImg.Width; x++)
            {
                for (int y = 0; y < LoadedImg.Height; y++)
                {
                    Color Pnt = LoadedBit.GetPixel(x,y);
                    px[x, y] = ColorConv.RGBtoLab(Pnt.R, Pnt.G, Pnt.B);
                }
            }

            for (int x = 0; x < LoadedImg.Width; x++)
            {
                for (int y = 0; y < LoadedImg.Height; y++)
                {
                    double res = (px[x, y].A + px[x, y].B) / 2;
                    px[x, y].A = res;
                    px[x, y].B = res;
                }
            }


            // Now put it back into a PNG.

            Bitmap Output = new Bitmap(LoadedImg.Width, LoadedImg.Height);
            for (int x = 0; x < LoadedImg.Width; x++)
            {
                for (int y = 0; y < LoadedImg.Height; y++)
                {
                    RGB backwards = ColorConv.LabtoRGB(px[x, y].L, px[x, y].A, px[x, y].B);
                    Output.SetPixel(x, y, Color.FromArgb(255, backwards.Red, backwards.Green, backwards.Blue));
                }
            }
            Output.Save("back.png");
        }
    }
}
