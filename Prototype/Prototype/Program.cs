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
            // This part make the LAB array.
            for (int x = 0; x < LoadedImg.Width; x++)
            {
                for (int y = 0; y < LoadedImg.Height; y++)
                {
                    Color Pnt = LoadedBit.GetPixel(x,y);
                    px[x, y] = ColorConv.RGBtoLab(Pnt.R, Pnt.G, Pnt.B);
                }
            }
            // this part actually changes the whole image to be color blind friendly
            for (int x = 0; x < LoadedImg.Width; x++)
            {
                for (int y = 0; y < LoadedImg.Height; y++)
                {
                    double res = (px[x, y].A + px[x, y].B) / 2;
                    px[x, y].A = res;
                    px[x, y].B = res;
                    // At this point the image is friendly with 99% of all colorblind people (:toot:)
                    // BUT WAIT, we can't just leave that 1% out. that would be mean!
                    px[x, y].L = (px[x, y].L + res) / 2;
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
