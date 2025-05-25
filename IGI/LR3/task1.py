import math
import Input_data

def Task1():
    """
    Function to compute arccos(x) using series decomposition.
    
    This function prompts the user for manual or automatic input of x and epsilon values.
    It calculates arccos(x) using series decomposition and compares with math.acos().
    Results are displayed in a formatted table.
    """
    max_iterations = 500
    
    # Input selection
    choice = Input_data.Input_data("Write 1 for manual input, 2 for automatic input: ", int, 1, 2)
    
    if choice == 1:
        # Manual input with validation
        while True:
            x = Input_data.Input_data("Write x (between -1 and 1): ", float, -1, 1)
            if x == -1 or x == 1:
                print("Error: x cannot be exactly -1 or 1. Please enter a different value.")
            else:
                break
        eps = Input_data.Input_data("Write eps (0 < eps < 1): ", float, 1e-10, 1)
    else:
        # Automatic random input
        x = Input_data.Random_Input(float, -0.999999999999999, 0.9999999999999999)
        eps = Input_data.Random_Input(float, 1e-10, 0.1)
    
    # Calculate arccos using decomposition
    result = math.pi / 2
    for n in range(max_iterations):
        numerator = math.factorial(2 * n)
        denominator = (4**n) * (math.factorial(n)**2) * (2 * n + 1)
        term = (numerator / denominator) * (x**(2 * n + 1))
        result -= term
        if abs(term) < eps:
            break
    
    # Get math library value
    actual_value = math.acos(x)
    
    # Format and display results as a table
    print("\nResults:")
    print("+---------+-----+------------+------------+----------+")
    print("|    x    |  n  |    F(x)    | Math F(x)  |   eps    |")
    print("+---------+-----+------------+------------+----------+")
    print(f"| {x:7.4f} | {n+1:3} | {result:10.6f} | {actual_value:10.6f} | {eps:8.2e} |")
    print("+---------+-----+------------+------------+----------+")
