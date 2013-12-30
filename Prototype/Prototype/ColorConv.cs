using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Prototype
{
    class ColorConv
    {
        public static CIEXYZ RGBtoXYZ(int red, int green, int blue)
        {
            // normalize red, green, blue values
            double rLinear = (double)red / 255.0;
            double gLinear = (double)green / 255.0;
            double bLinear = (double)blue / 255.0;

            // convert to a sRGB form
            double r = (rLinear > 0.04045) ? Math.Pow((rLinear + 0.055) / (
                1 + 0.055), 2.2) : (rLinear / 12.92);
            double g = (gLinear > 0.04045) ? Math.Pow((gLinear + 0.055) / (
                1 + 0.055), 2.2) : (gLinear / 12.92);
            double b = (bLinear > 0.04045) ? Math.Pow((bLinear + 0.055) / (
                1 + 0.055), 2.2) : (bLinear / 12.92);

            // converts
            return new CIEXYZ(
                (r * 0.4124 + g * 0.3576 + b * 0.1805),
                (r * 0.2126 + g * 0.7152 + b * 0.0722),
                (r * 0.0193 + g * 0.1192 + b * 0.9505)
                );
        }

        public static RGB XYZtoRGB(double x, double y, double z)
        {
            double[] Clinear = new double[3];
            Clinear[0] = x * 3.2410 - y * 1.5374 - z * 0.4986; // red
            Clinear[1] = -x * 0.9692 + y * 1.8760 - z * 0.0416; // green
            Clinear[2] = x * 0.0556 - y * 0.2040 + z * 1.0570; // blue

            for (int i = 0; i < 3; i++)
            {
                Clinear[i] = (Clinear[i] <= 0.0031308) ? 12.92 * Clinear[i] : (
                    1 + 0.055) * Math.Pow(Clinear[i], (1.0 / 2.4)) - 0.055;
            }

            return new RGB(
                Convert.ToInt32(Double.Parse(String.Format("{0:0.00}",
                    Clinear[0] * 255.0))),
                Convert.ToInt32(Double.Parse(String.Format("{0:0.00}",
                    Clinear[1] * 255.0))),
                Convert.ToInt32(Double.Parse(String.Format("{0:0.00}",
                    Clinear[2] * 255.0)))
                );
        }
    }

    public struct CIEXYZ
    {
        /// <summary>
        /// Gets an empty CIEXYZ structure.
        /// </summary>
        public static readonly CIEXYZ Empty = new CIEXYZ();
        /// <summary>
        /// Gets the CIE D65 (white) structure.
        /// </summary>
        public static readonly CIEXYZ D65 = new CIEXYZ(0.9505, 1.0, 1.0890);


        private double x;
        private double y;
        private double z;

        public static bool operator ==(CIEXYZ item1, CIEXYZ item2)
        {
            return (
                item1.X == item2.X
                && item1.Y == item2.Y
                && item1.Z == item2.Z
                );
        }

        public static bool operator !=(CIEXYZ item1, CIEXYZ item2)
        {
            return (
                item1.X != item2.X
                || item1.Y != item2.Y
                || item1.Z != item2.Z
                );
        }

        /// <summary>
        /// Gets or sets X component.
        /// </summary>
        public double X
        {
            get
            {
                return this.x;
            }
            set
            {
                this.x = (value > 0.9505) ? 0.9505 : ((value < 0) ? 0 : value);
            }
        }

        /// <summary>
        /// Gets or sets Y component.
        /// </summary>
        public double Y
        {
            get
            {
                return this.y;
            }
            set
            {
                this.y = (value > 1.0) ? 1.0 : ((value < 0) ? 0 : value);
            }
        }

        /// <summary>
        /// Gets or sets Z component.
        /// </summary>
        public double Z
        {
            get
            {
                return this.z;
            }
            set
            {
                this.z = (value > 1.089) ? 1.089 : ((value < 0) ? 0 : value);
            }
        }

        public CIEXYZ(double x, double y, double z)
        {
            this.x = (x > 0.9505) ? 0.9505 : ((x < 0) ? 0 : x);
            this.y = (y > 1.0) ? 1.0 : ((y < 0) ? 0 : y);
            this.z = (z > 1.089) ? 1.089 : ((z < 0) ? 0 : z);
        }

        public override bool Equals(Object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            return (this == (CIEXYZ)obj);
        }

        public override int GetHashCode()
        {
            return X.GetHashCode() ^ Y.GetHashCode() ^ Z.GetHashCode();
        }

    }

    public struct RGB
    {
        /// <summary>
        /// Gets an empty RGB structure;
        /// </summary>
        public static readonly RGB Empty = new RGB();

        private int red;
        private int green;
        private int blue;

        public static bool operator ==(RGB item1, RGB item2)
        {
            return (
                item1.Red == item2.Red
                && item1.Green == item2.Green
                && item1.Blue == item2.Blue
                );
        }

        public static bool operator !=(RGB item1, RGB item2)
        {
            return (
                item1.Red != item2.Red
                || item1.Green != item2.Green
                || item1.Blue != item2.Blue
                );
        }

        /// <summary>
        /// Gets or sets red value.
        /// </summary>
        public int Red
        {
            get
            {
                return red;
            }
            set
            {
                red = (value > 255) ? 255 : ((value < 0) ? 0 : value);
            }
        }

        /// <summary>
        /// Gets or sets red value.
        /// </summary>
        public int Green
        {
            get
            {
                return green;
            }
            set
            {
                green = (value > 255) ? 255 : ((value < 0) ? 0 : value);
            }
        }

        /// <summary>
        /// Gets or sets red value.
        /// </summary>
        public int Blue
        {
            get
            {
                return blue;
            }
            set
            {
                blue = (value > 255) ? 255 : ((value < 0) ? 0 : value);
            }
        }

        public RGB(int R, int G, int B)
        {
            this.red = (R > 255) ? 255 : ((R < 0) ? 0 : R);
            this.green = (G > 255) ? 255 : ((G < 0) ? 0 : G);
            this.blue = (B > 255) ? 255 : ((B < 0) ? 0 : B);
        }

        public override bool Equals(Object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            return (this == (RGB)obj);
        }

        public override int GetHashCode()
        {
            return Red.GetHashCode() ^ Green.GetHashCode() ^ Blue.GetHashCode();
        }
    }
}
