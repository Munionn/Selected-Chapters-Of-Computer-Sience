from datetime import datetime
import csv
import pickle
from Input_data import input_data

class Applicant:
    applicant_count = 0

    def __init__(self, full_name: str):
        self._full_name = full_name
        Applicant.applicant_count += 1

    @property
    def full_name(self):
        return self._full_name

    @full_name.setter
    def full_name(self, value: str):
        if not value.strip():
            raise ValueError("Full name cannot be empty")
        self._full_name = value

    def get_info(self):
        return f"Applicant: {self.full_name}"

    def __str__(self):
        return f"{self.get_info()}"

    def __eq__(self, other):
        return self.full_name == other.full_name

class Student(Applicant):
    def __init__(self, full_name: str, birth_date: str):
        super().__init__(full_name)
        self.birth_date = birth_date

    @property
    def birth_date(self):
        return self._birth_date

    @birth_date.setter
    def birth_date(self, value: str):
        try:
            datetime.strptime(value, "%d.%m.%Y")
            self._birth_date = value
        except ValueError:
            raise ValueError("Incorrect date format. Use DD.MM.YYYY.")

    def __reduce__(self):
        return (self.__class__, (self.full_name, self.birth_date))

    def get_info(self):
        return f"Student: {self.full_name}, Birthday: {self.birth_date}"

class SchoolClass:
    def __init__(self, name: str):
        self.name = name
        self.students = []

    def add_student(self, student: Student):
        self.students.append(student)

    def calculate_average_birthdate(self):
        if not self.students:
            raise ValueError("The class has no students")

        total_day = total_month = total_year = 0
        for student in self.students:
            day, month, year = map(int, student.birth_date.split("."))
            total_day += day
            total_month += month
            total_year += year

        avg_day = total_day // len(self.students)
        avg_month = total_month // len(self.students)
        avg_year = total_year // len(self.students)

        return f"{avg_day:02}.{avg_month:02}.{avg_year}"

    def find_student_by_name(self, full_name: str):
        for student in self.students:
            if student.full_name == full_name:
                return student
        return None

    def sort_students_by_name(self):
        self.students.sort(key=lambda x: x.full_name)

    def save_to_csv(self, filename: str):
        with open(filename, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow(["Full Name", "Birthday"])
            for student in self.students:
                writer.writerow([student.full_name, student.birth_date])
        print(f"Data successfully saved to {filename}.")

    def load_from_csv(self, filename: str):
        self.students.clear()
        try:
            with open(filename, mode="r", encoding="utf-8") as file:
                reader = csv.reader(file)
                next(reader)
                for row in reader:
                    full_name, birth_date = row
                    self.add_student(Student(full_name, birth_date))
            print(f"Data successfully loaded from {filename}.")
        except FileNotFoundError:
            print(f"File {filename} not found.")

    def save_to_pickle(self, filename: str):
        with open(filename, mode="wb") as file:
            pickle.dump(self, file)
        print(f"Data successfully saved to {filename}.")

    def load_from_pickle(self, filename: str):
        try:
            with open(filename, mode="rb") as file:
                loaded = pickle.load(file)
                self.name = loaded.name
                self.students = loaded.students
            print(f"Data successfully loaded from {filename}.")
        except (FileNotFoundError, AttributeError) as e:
            print(f"Error loading file: {e}")

    def __str__(self):
        return f"Class Name: {self.name}, Number of Students: {len(self.students)}"

def validate_full_name(full_name: str):
    parts = full_name.split()
    if len(parts) != 2:
        raise ValueError("Full name must be: Lastname Initials (e.g., Ivanov A.A)")
    
    lastname, initials = parts
    if not lastname.isalpha():
        raise ValueError("Lastname must contain only letters")
    
    if not (1 < len(initials) <= 3):
        raise ValueError("Initials must be 1-3 characters (e.g., A or A.A)")
    if not all(c.isalpha() or c == '.' for c in initials):
        raise ValueError("Initials can only contain letters and dots")

def validate_birth_date(birth_date: str):
    try:
        datetime.strptime(birth_date, "%d.%m.%Y")
    except ValueError:
        raise ValueError("Incorrect date format. Use DD.MM.YYYY.")

def task1():
    print("=== School Class Management Program ===")
    school_class = SchoolClass("5A")

    while True:
        print("\nMenu:")
        print("1. Add a student")
        print("2. Display the list of students")
        print("3. Sort students by last name")
        print("4. Find a student by full name")
        print("5. Calculate the average birthdate of the class")
        print("6. Save data to a CSV file")
        print("7. Load data from a CSV file")
        print("8. Save data to a pickle file")
        print("9. Load data from a pickle file")
        print("0. Exit")

        choice = input_data("Select a menu item: ", int, 0, 9)

        if choice == 1:
            while True:
                full_name = input_data("Enter the student's full name (e.g., Ivanov A.A.): ", str)
                try:
                    validate_full_name(full_name)
                    break
                except ValueError as e:
                    print(f"Error: {e}. Please try again.")

            while True:
                birth_date = input_data("Enter the date of birth (format DD.MM.YYYY): ", str)
                try:
                    validate_birth_date(birth_date)
                    break
                except ValueError as e:
                    print(f"Error: {e}. Please try again.")

            try:
                student = Student(full_name, birth_date)
                school_class.add_student(student)
                print(f"Student {full_name} successfully added to the class.")
            except ValueError as e:
                print(f"Error: {e}")

        elif choice == 2:
            print("List of students:")
            for student in school_class.students:
                print(student.get_info())
                print("----------------------")

        elif choice == 3:
            school_class.sort_students_by_name()
            print("Students sorted by last name.")

        elif choice == 4:
            full_name = input_data("Enter the student's full name to search: ", str)
            student = school_class.find_student_by_name(full_name)
            if student:
                print(student.get_info())
            else:
                print("Student not found.")

        elif choice == 5:
            try:
                avg_birthdate = school_class.calculate_average_birthdate()
                print(f"Average birthdate of the class: {avg_birthdate}")
            except ValueError as e:
                print(e)

        elif choice == 6:
            school_class.save_to_csv("school_class.csv")
        elif choice == 7:
            school_class.load_from_csv("school_class.csv")

        elif choice == 8:
            school_class.save_to_pickle("school_class.pickle")

        elif choice == 9:
            school_class.load_from_pickle("school_class.pickle")

        elif choice == 0:
            print("Program completed.")
            break

