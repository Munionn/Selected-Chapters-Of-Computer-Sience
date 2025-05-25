import math
from abc import ABC, abstractmethod
from matplotlib import pyplot as plt
from matplotlib.patches import Polygon
from Input_data import input_data
# Mixin Class for Drawing Functionality
class DrawableMixin:
    def draw(self):
        # Coordinates of trapezoid vertices
        a = self.base_a
        b = self.base_b
        h = self.height
        
        # Calculate offset for the top base
        offset = (a - b) / 2
        
        # Vertex coordinates (bottom base left to right, then top base right to left)
        vertices = [
            (0, 0),                  # bottom left
            (a, 0),                  # bottom right
            (a - offset, h),         # top right
            (offset, h)              # top left
        ]
        
        # Create polygon
        trapezoid = Polygon(vertices, closed=True)
        
        fig, ax = plt.subplots()
        ax.add_patch(trapezoid)
        
        # Set color
        color_map = {
            "red": "red",
            "green": "green",
            "blue": "blue",
            "black": "black",
            "yellow": "yellow"
        }
        trapezoid.set_facecolor(color_map.get(self.color.color.lower(), "blue"))
        
        # Set boundaries and label
        ax.set_xlim(-1, max(a, b) + 1)
        ax.set_ylim(-1, h + 2)
        plt.axis('equal')
        
        # Save and display
        plt.savefig("trapezoid.png")
        plt.show()

# Abstract Base Class for Geometric Figures
class GeometricFigure(ABC):
    @abstractmethod
    def calculate_area(self):
        pass

# Class for Figure Color
class FigureColor:
    def __init__(self, color):
        self.color = color

    @property
    def color(self):
        return self._color

    @color.setter
    def color(self, value):
        self._color = value

# Isosceles Trapezoid Class (inherits from GeometricFigure and DrawableMixin)
class IsoscelesTrapezoid(GeometricFigure, DrawableMixin):
    _figure_name = "Isosceles Trapezoid"

    def __init__(self, color, height, base_a, midline_b):
        self.color = FigureColor(color)
        self.height = height
        self.base_a = base_a
        self.midline_b = midline_b
        self.base_b = 2 * midline_b - base_a

    @property
    def figure_name(self):
        return self._figure_name

    @figure_name.setter
    def figure_name(self, value):
        self._figure_name = value

    def calculate_area(self):
        # Area using midline formula
        return self.midline_b * self.height

    def __str__(self):
        return ("{} with height {} units, bases {} and {} units, "
                "midline {} units, color: {}, area: {:.2f} sq.units").format(
            self.figure_name, self.height, self.base_a, self.base_b, 
            self.midline_b, self.color.color, self.calculate_area()
        )
    
def task4():
    print("Creating an Isosceles Trapezoid")
    
    # Input parameters
    name = input_data("Enter figure name: ", str)
    height = input_data("Enter trapezoid height: ", float)
    base_a = input_data("Enter first base length: ", float)
    midline_b = input_data("Enter midline length: ", float)
    
    # Validate midline input
    while midline_b <= base_a / 2:
        print("Midline must be greater than half of the first base!")
        midline_b = input_data("Enter midline length: ", float)
    
    allowed_colors = ["red", "green", "blue", "black", "yellow"]
    color = input_data("Enter figure color (red, green, blue, black, yellow): ", str)
    while color.lower() not in allowed_colors:
        print("Invalid color! Please try again.")
        color = input_data("Enter figure color (red, green, blue, black, yellow): ", str)
    
    # Create and display trapezoid
    trapezoid = IsoscelesTrapezoid(color, height, base_a, midline_b)
    trapezoid.figure_name = name
    print(trapezoid)
    trapezoid.draw()

