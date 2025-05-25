from Input_data import Input_data, Random_Input

# Character sets
digits = {'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'}
punctuation_marks = {'!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~'}

def Task3():
    """
    Function to count spaces, digits and punctuation marks in a string.
    
    Offers manual or automatic input mode.
    In manual mode, user enters a string.
    In automatic mode, generates a random string with mixed characters.
    """
    # Input selection
    choice = Input_data("Write 1 for manual input, 2 for automatic input: ", int, 1, 2)
    
    if choice == 1:
        # Manual input
        input_string = Input_data("Enter your string: ", str)
    else:
        # Automatic generation - create string with random characters
        length = Random_Input(int, 20, 50)
        chars = []
        for _ in range(length):
            # Randomly choose between letters, digits, punctuation or space
            char_type = Random_Input(int, 0, 3)
            if char_type == 0:  # letter
                chars.append(Random_Input(str, 1, 1))
            elif char_type == 1:  # digit
                chars.append(Random_Input(str, 1, 1))
            elif char_type == 2:  # punctuation
                chars.append(Random_Input(str, 1, 1))
            else:  # space
                chars.append(' ')
        input_string = ''.join(chars)
        print("\nGenerated string:")
        print(input_string)
    
    # Count characters
    spaces = numbers_count = marks = 0
    for char in input_string:
        if char == ' ':
            spaces += 1
        elif char in digits:
            numbers_count += 1
        elif char in punctuation_marks:
            marks += 1
    
    # Display results
    print("\nResults:")
    print(f"Input string: '{input_string}'")
    print("Counts:")
    print(f"Spaces: {spaces}")
    print(f"Digits: {numbers_count}")
    print(f"Punctuation marks: {marks}")

if __name__ == '__main__':
    Task3()