import math
import numpy as np
from tabulate import tabulate
from statistics import median, mode, variance, stdev, StatisticsError
import matplotlib.pyplot as plt

class Sequence:
    def __init__(self, sequence):
        self.sequence = sequence
    
    def calculate_mean(self):
        return sum(self.sequence) / len(self.sequence)
    
    def calculate_median(self):
        return median(self.sequence)
    
    def calculate_mode(self):
        try:
            return mode(self.sequence)
        except StatisticsError:
            return "No unique mode"
    
    def calculate_variance(self):
        return variance(self.sequence)
    
    def calculate_standard_deviation(self):
        return stdev(self.sequence)


class SequenceCalculator(Sequence):
    def __init__(self, max_iteration, eps):
        super().__init__([])
        self.max_iteration = max_iteration
        self.eps = eps

    def calculate_sequence(self, x):
        res = math.pi / 2 
        n = 0  
        term = float('inf') 
        while abs(term) > self.eps and n < self.max_iteration:
            numerator = math.factorial(2 * n)
            denominator = (4**n) * (math.factorial(n)**2) * (2 * n + 1)
            term = (numerator / denominator) * (x**(2 * n + 1))
            res -= term  
            self.sequence.append(res) 
            n += 1
        return res
    
    def generate_table(self, x, res, actual_value):
        table_data = [[x, len(self.sequence), res, actual_value, self.eps]]
        table_header = ["x", "Iterations", "F(x)", "Math F(x)", "Epsilon"]
        table = tabulate(table_data, headers=table_header, floatfmt='.8f')
        return table


def calculate_actual_value(x):
    return math.acos(x)

def task3():
    max_iteration = 500
    
    # Input validation
    try:
        x = float(input("Enter x (-1 to 1): "))
        if not -1 <= x <= 1:
            raise ValueError("x must be in the range [-1, 1].")
        eps = float(input("Enter epsilon (0 to 1): "))
        if eps <= 0 or eps >= 1:
            raise ValueError("Epsilon must be in the range (0, 1).")
    except ValueError as e:
        print(f"Invalid input: {e}")
        return
    
    calculator = SequenceCalculator(max_iteration, eps)
    res = calculator.calculate_sequence(x)
    actual_value = calculate_actual_value(x)
    table = calculator.generate_table(x, res, actual_value)
    print(table)
    print("Mean value:", calculator.calculate_mean())
    print("Median value:", calculator.calculate_median())
    print("Mode value:", calculator.calculate_mode())
    print("Variance value:", calculator.calculate_variance())
    print("Standard deviation value:", calculator.calculate_standard_deviation())

    # Plotting
    x_values = range(1, len(calculator.sequence) + 1)
    y_values = calculator.sequence
    plt.plot(x_values, y_values, color="blue", label="Series Approximation")
    plt.plot(x_values, [actual_value] * len(calculator.sequence), color="red",
             linestyle="--", label="Mathematical acos(x)")
    plt.xlabel('Iteration Number')
    plt.ylabel('F(x)')
    plt.legend()
    plt.grid(True)
    plt.title("Function Expansion Series for acos(x)")
    plt.savefig("Task3.png")
    plt.show()

