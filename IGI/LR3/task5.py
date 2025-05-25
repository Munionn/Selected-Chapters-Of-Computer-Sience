from Input_data import Input_data, Random_Input  


def get_float_list():
    """
    Gets a list of floats either through manual input or random generation
    Returns:
        list: List of float numbers
    """
    choice = Input_data("Choose input method (1-manual, 2-random): ", int, 1, 2)
    
    if choice == 1:
        n = Input_data("Enter number of elements: ", int, 1)
        float_list = []
        for i in range(n):
            num = Input_data(f"Enter element {i+1}: ", float)
            float_list.append(num)
        return float_list
    else:
        n = Random_Input(int, 5, 15)  # Generate 5-15 elements
        return [Random_Input(float, -100, 100) for _ in range(n)]

def find_max_index(lst):
    """
    Finds index of max element 
    Args:
        lst (list): List of numbers
    Returns:
        tuple: (max_index, product) or (None, None) if invalid
    """
    return lst.index(max(lst))  

def find_product(lst):
    """
    Finds index of max element and product between first two non-zero elements
    Args:
        lst (list): List of numbers
    Returns:
        tuple: (max_index, product) or (None, None) if invalid
    """
    if not lst:
      return None, None
    
    # Find max element index
    
    
    first_non_zero = None
    second_non_zero = None
    
    for i in range(len(lst)):
        if lst[i] != 0:
            if first_non_zero is None:
                first_non_zero = i
            elif second_non_zero is None:
                second_non_zero = i
                break
    
    # Если не нашли два ненулевых элемента
    if first_non_zero is None or second_non_zero is None:
        return None
    
    # Вычисляем произведение элементов между ними
    
    product = 1.0
    for i in range(first_non_zero, second_non_zero+1):
        product *= lst[i]
    
    return product
    

def Task5():
    print("Task 5: List Processor")
    print("----------------------")
    
    # 1. Get list with validation
    numbers = get_float_list()
    
    # 2. Display list
    print("\nGenerated list:")
    print("[ " + ", ".join(f"{x:.2f}" for x in numbers) + " ]")
    
    # 3. Process list
    max_idx = find_max_index(numbers);
    product = find_product(numbers)
    
    # 4. Display results
    print("\nResults:")
    if max_idx is not None:
        print(f"• Max element at index {max_idx} (value = {numbers[max_idx]:.2f})")
    else:
        print("• List is empty")
    
    if product is not None:
        print(f"• Product between first two non-zero elements: {product:.4f}")
    else:
        print("• Not enough non-zero elements to calculate product")

