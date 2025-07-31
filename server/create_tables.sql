CREATE TABLE Income (
    id INT PRIMARY KEY IDENTITY(1,1),
    description NVARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    paid BIT DEFAULT 0
);

CREATE TABLE Expenses (
    id INT PRIMARY KEY IDENTITY(1,1),
    description NVARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    paid BIT DEFAULT 0
);

CREATE TABLE Liabilities (
    id INT PRIMARY KEY IDENTITY(1,1),
    description NVARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    dueDate DATE NOT NULL,
    paid BIT DEFAULT 0
);

CREATE TABLE FixedEntries (
    id INT PRIMARY KEY IDENTITY(1,1),
    type NVARCHAR(50) NOT NULL, -- 'income', 'expenses', 'liabilities'
    description NVARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    dueDate DATE, -- Only applicable for liabilities
    paid BIT DEFAULT 0
);
