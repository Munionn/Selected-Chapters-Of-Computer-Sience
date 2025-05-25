import math
import unittest
from Task4 import IsoscelesTrapezoid


class IsoscelesTrapezoidTestCase(unittest.TestCase):
    def test_calculate_area(self):
        trapezoid = IsoscelesTrapezoid("red", 5, 8, 7)
        expected_area = 7 * 5  # midline * height
        self.assertAlmostEqual(trapezoid.calculate_area(), expected_area)

    def test_base_b_calculation(self):
        trapezoid = IsoscelesTrapezoid("blue", 4, 10, 8)
        # midline = (base_a + base_b)/2 => base_b = 2*midline - base_a
        expected_base_b = 2 * 8 - 10
        self.assertEqual(trapezoid.base_b, expected_base_b)

    def test_draw(self):
       trapezoid = IsoscelesTrapezoid("green", 3, 6, 5)
       self.assertIsNone(trapezoid.draw())  # draw() doesn't return anything

    def test_figure_name(self):
        trapezoid = IsoscelesTrapezoid("yellow", 4, 7, 6)
        trapezoid.figure_name = "My Trapezoid"
        self.assertEqual(trapezoid.figure_name, "My Trapezoid")

    def test_str_representation(self):
        trapezoid = IsoscelesTrapezoid("black", 5, 8, 7)
        trapezoid.figure_name = "Special Trapezoid"
        expected_str = ("Special Trapezoid with height 5 units, bases 8 and 6 units, "
                       "midline 7 units, color: black, area: 35.00 sq.units")
        self.assertEqual(str(trapezoid), expected_str)
 

if __name__ == '__main__':
    unittest.main()