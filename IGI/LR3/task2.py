from Input_data import Input_data, Random_Input

def generate_last_digits(numbers):
    """
    Generator function to yield last digits of numbers.
    """
    for num in numbers:
        yield abs(num) % 10

def Task2():
    """
    Function to calculate product of last digits of input numbers.
    
    Offers manual or automatic input mode.
    In manual mode, user enters numbers until entering 0.
    In automatic mode, generates random numbers (5-15 numbers).
    """
    numbers = []
    
    # Input selection
    choice = Input_data("Write 1 for manual input, 2 for automatic input: ", int, 1, 2)
    
    if choice == 1:
        # Manual input mode
        print("Enter numbers (0 to finish):")
        while True:
            num = Input_data("", int)
            if num == 0:
                break
            numbers.append(num)
    else:
        # Automatic mode - generate 5-15 random numbers
        count = Random_Input(int, 5, 15)
        print(f"Generated {count} random numbers:")
        for _ in range(count):
            num = Random_Input(int, -1000, 1000)
            numbers.append(num)
            print(num)
        print("0 (automatic end)")
    
    # Use generator to get last digits and calculate product
    product = 1
    last_digits = []
    
    for last_digit in generate_last_digits(numbers):
        last_digits.append(last_digit)
        product *= last_digit
    
    # Display results
    print("\nResults:")
    print("Entered numbers:", numbers)
    print("Last digits:", last_digits)
    print(f"Product of last digits: {product}")

