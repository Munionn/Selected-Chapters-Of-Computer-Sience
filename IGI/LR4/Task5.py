import numpy as np
import Input_data  

class Matrix:
    def __init__(self, rows, columns):
        self.rows = rows
        self.columns = columns
        self.data = np.empty((rows, columns))
    
    def fill_random(self):
        self.data = np.random.randint(-100, 100, size=(self.rows, self.columns))
    
    def display(self):
        print(self.data)

class IntegerMatrix(Matrix):
    def __init__(self, rows, columns):
        super().__init__(rows, columns)
        self.data = np.empty((rows, columns), dtype=int)
    
    def count_even_odd(self):
        even = np.count_nonzero(self.data % 2 == 0)
        odd = self.data.size - even
        return even, odd
    
    def even_odd_correlation(self):
      even_mask = self.data % 2 == 0
      odd_mask = ~even_mask
      
      even_elements = self.data[even_mask]
      odd_elements = self.data[odd_mask]
      
      # Use the minimum length to avoid padding with nan
      min_len = min(len(even_elements), len(odd_elements))
      if min_len < 2:  
          return np.nan
      
      # Take first min_len elements from both arrays
      even_subset = even_elements[:min_len]
      odd_subset = odd_elements[:min_len]
      
      # Calculate correlation coefficient
      corr_matrix = np.corrcoef(even_subset, odd_subset)
      return corr_matrix[0, 1]  # Return the correlation coefficient
    
    def calculate_stats(self):
        stats = {
            'mean': np.mean(self.data),
            'median': np.median(self.data),
            'variance': np.var(self.data),
            'std_dev': np.std(self.data),
        }
        return stats

def task5():
    # Get matrix dimensions from user
    m = Input_data.input_data("Enter number of rows: ", int, 1, 10000)
    n = Input_data.input_data("Enter number of columns: ", int, 1, 10000)
    
    # Create and fill matrix
    matrix = IntegerMatrix(m, n)
    matrix.fill_random()
    
    print("\nOriginal matrix:")
    matrix.display()
    
    # Count even/odd numbers
    even, odd = matrix.count_even_odd()
    print(f"\nEven numbers: {even}, Odd numbers: {odd}")
    
    # Calculate correlation
    corr = matrix.even_odd_correlation()
    print(f"\nCorrelation between even and odd elements: {corr:.2f}")
    
    # Calculate statistics
    stats = matrix.calculate_stats()
    print("\nMatrix statistics:")
    print(f"Mean: {stats['mean']:.2f}")
    print(f"Median: {stats['median']:.2f}")
    print(f"Variance: {stats['variance']:.2f}")
    print(f"Standard deviation: {stats['std_dev']:.2f}")

