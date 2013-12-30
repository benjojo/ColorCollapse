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
            CIELab[,] px = new CIELab[LoadedImg.Width, LoadedImg.Height];

            for (int x = 0; x < LoadedImg.Width - 1; x++)
            {
                for (int y = 0; y < LoadedImg.Height - 1; y++)
                {
                    Color Pnt = LoadedBit.GetPixel(x,y);
                    px[x, y] = ColorConv.RGBtoLab(Pnt.R, Pnt.G, Pnt.B);
                }
            }

        }
    }
}
