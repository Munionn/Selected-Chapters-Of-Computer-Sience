from Input_data import Input_data, Random_Input
import time

def measure_time(func):
    
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs);
        end_time = time.time()
        print(f"Function '{func.__name__}' took {end_time - start_time:.4f} seconds to execute.")
        return result
    return wrapper
# Character sets
vowels = {'a', 'e', 'i', 'o', 'u'}
@measure_time
def Task4():
    """
    Function to analyze text for:
    1) Words starting/ending with vowels
    2) Character frequency count
    3) Words after commas (sorted)
    
    Offers manual or automatic input mode.
    """
    # Input selection
    choice = Input_data("Write 1 for manual input, 2 for automatic input: ", int, 1, 2)
    
    if choice == 1:
        # Manual input
        text = Input_data("Enter your text: ", str)
    else:
        # Automatic generation - create random sentence with commas
        words = [Random_Input(str, 3, 8) for _ in range(Random_Input(int, 10, 20))]
        # Insert commas randomly
        for i in range(1, len(words)):
            if Random_Input(int, 0, 4) == 0:  # 20% chance per word
                words[i] = ',' + words[i]
        text = ' '.join(words).capitalize() + '.'
        print("\nGenerated text:")
        print(text)
    
    # Perform all analyses
    vowel_words = count_vowel_words(text)
    char_counts = count_chars(text)
    comma_words = get_words_after_comma(text)
    
    # Display results
    print("\nResults:")
    print(f"1. Words starting/ending with vowels: {vowel_words}")
    print("2. Character counts:")
    for char, count in sorted(char_counts.items()):
        print(f"   '{char}': {count}")
    print(f"3. Words after commas (sorted): {', '.join(comma_words)}")

def count_vowel_words(text):
    """Count words starting or ending with vowels"""
    words = text.lower().replace(',', ' ').split()
    return sum(1 for word in words if word and (word[0] in vowels or word[-1] in vowels))

def count_chars(text):
    """Count frequency of each character"""
    counts = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1
    return counts

def get_words_after_comma(text):
    """Get sorted list of words following commas"""
    words = []
    for part in text.split(',')[1:]:
        part = part.strip()
        if part:
            first_word = part.split()[0]
            words.append(first_word.lower())
    return sorted(words)

